// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/// @title OrchorCore1155
/// @notice 技能卡从 mapping 里的 bool 升级为真正的链上资产。
///
///         与旧版 OrchorCore 的三处根本差异：
///         1. 技能卡是 ERC-1155 代币 —— 可转让、钱包可见、可挂 CLOB
///         2. hasAccess 由 balanceOf 派生，卡转走权限即刻转移（旧的 owned mapping 已彻底删除）
///         3. ERC-2981 二级版税 —— 创作者在每一次转手中继续分成，而不只是首次解锁
///
///         选 1155 而不是 721 的理由：同一技能的 N 份互为同质，才有单一价格和买卖盘深度。
///         721 只能做成 OpenSea 式一物一价，上不了原生订单簿。
///
///         tokenURI 全链上渲染：卡面 SVG 由合约当场生成，不依赖 IPFS 或任何服务器。
contract OrchorCore1155 is ERC1155, ERC2981, ReentrancyGuard {
    using Strings for uint256;

    enum Rarity { Common, Rare, Epic, Legendary, Mythic }

    struct Skill {
        string name;
        address payable creator;
        Rarity rarity;
        uint64 energyCost;
        uint128 unlockPriceWei;
        uint128 subscriptionPriceWei;
        uint32 mintCap;      // 0 = 不限量
        uint32 minted;       // 累计铸造，用于硬上限（不随转让/销毁变化）
        bool active;
    }

    /// 1 INJ = 100 Energy
    uint256 public constant NATIVE_TO_ENERGY = 100;

    /// 一级市场分账（基点），总和必须为 10_000
    uint16 public constant CREATOR_BPS  = 7000;
    uint16 public constant PLATFORM_BPS = 2500;
    uint16 public constant ONCHAIN_BPS  =  500;

    /// 二级市场版税（基点）。7% 是流动性与创作者收益的平衡点：
    /// 定太高会杀死转手意愿，从而杀死价格发现。可由 owner 逐卡调整。
    uint96 public constant DEFAULT_ROYALTY_BPS = 700;

    /// 技能名长度上限。防止超长名撑爆 tokenURI 的 gas。
    uint256 public constant MAX_NAME_LEN = 48;

    address public owner;
    address public platformTreasury;

    uint256 public nextSkillId;
    mapping(uint256 => Skill) public skills;

    /// 订阅是租约，不可转让，因此仍是 mapping。
    mapping(address => mapping(uint256 => uint64)) public subscriptionExpiry;
    mapping(address => uint256) public energyOf;

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    event SkillRegistered(
        uint256 indexed skillId, string name, address indexed creator, Rarity rarity,
        uint64 energyCost, uint128 unlockPriceWei, uint128 subscriptionPriceWei, uint32 mintCap
    );
    event SkillToggled(uint256 indexed skillId, bool active);
    event EnergyToppedUp(address indexed user, uint256 paid, uint256 energyAdded);
    event SkillUnlocked(address indexed user, uint256 indexed skillId, uint256 amount, uint256 pricePaid);
    event SkillSubscribed(address indexed user, uint256 indexed skillId, uint256 pricePaid, uint64 expiresAt);
    event SkillInvoked(address indexed user, uint256 indexed skillId, uint64 energySpent, bytes32 inputHash);
    event RevenueSplit(uint256 indexed skillId, address indexed creator, uint256 creatorAmount, uint256 platformAmount, uint256 onchainAmount);

    constructor(address _platformTreasury) ERC1155("") {
        require(_platformTreasury != address(0), "ZERO_TREASURY");
        owner = msg.sender;
        platformTreasury = _platformTreasury;
    }

    /* ───────────────────────── 管理 ───────────────────────── */

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ZERO_OWNER");
        owner = newOwner;
    }

    function setPlatformTreasury(address t) external onlyOwner {
        require(t != address(0), "ZERO_TREASURY");
        platformTreasury = t;
    }

    /// @notice 调整某张卡的二级版税。上限 10% —— 再高会伤流动性。
    function setSkillRoyalty(uint256 skillId, uint96 bps) external onlyOwner {
        require(bps <= 1000, "ROYALTY_TOO_HIGH");
        _setTokenRoyalty(skillId, skills[skillId].creator, bps);
    }

    /* ─────────────────────── 创作者接口 ─────────────────────── */

    function registerSkill(
        string calldata name,
        Rarity rarity,
        uint64 energyCost,
        uint128 unlockPriceWei,
        uint128 subscriptionPriceWei,
        uint32 mintCap
    ) external returns (uint256 skillId) {
        bytes memory n = bytes(name);
        require(n.length > 0 && n.length <= MAX_NAME_LEN, "BAD_NAME_LEN");
        // tokenURI 会把 name 拼进 JSON 与 SVG。禁掉双引号、反斜杠和尖括号，
        // 否则一个恶意技能名可以注入 metadata 甚至在市场页面里注入标签。
        for (uint256 i = 0; i < n.length; i++) {
            bytes1 c = n[i];
            require(c != 0x22 && c != 0x5C && c != 0x3C && c != 0x3E, "BAD_NAME_CHAR");
            require(uint8(c) >= 0x20, "BAD_NAME_CTRL");
        }
        require(energyCost > 0, "ZERO_ENERGY");
        if (rarity == Rarity.Mythic) {
            require(mintCap > 0, "MYTHIC_NEEDS_CAP");
        } else {
            require(mintCap == 0, "CAP_ONLY_MYTHIC");
        }

        skillId = nextSkillId++;
        skills[skillId] = Skill({
            name: name,
            creator: payable(msg.sender),
            rarity: rarity,
            energyCost: energyCost,
            unlockPriceWei: unlockPriceWei,
            subscriptionPriceWei: subscriptionPriceWei,
            mintCap: mintCap,
            minted: 0,
            active: true
        });

        // 二级版税默认归创作者
        _setTokenRoyalty(skillId, payable(msg.sender), DEFAULT_ROYALTY_BPS);

        emit SkillRegistered(skillId, name, msg.sender, rarity, energyCost, unlockPriceWei, subscriptionPriceWei, mintCap);
    }

    function setSkillActive(uint256 skillId, bool active) external {
        Skill storage s = skills[skillId];
        require(s.creator == msg.sender || msg.sender == owner, "NOT_AUTH");
        s.active = active;
        emit SkillToggled(skillId, active);
    }

    /* ───────────────────────── 用户操作 ───────────────────────── */

    function topUpEnergy() external payable nonReentrant {
        require(msg.value > 0, "NO_PAYMENT");
        uint256 energy = (msg.value * NATIVE_TO_ENERGY) / 1 ether;
        require(energy > 0, "BELOW_MIN");

        // 只收取整份对应的金额，余数退回。旧版注释说退零钱但实际没退，这里补上。
        uint256 charged = (energy * 1 ether) / NATIVE_TO_ENERGY;
        uint256 refund = msg.value - charged;

        energyOf[msg.sender] += energy;

        (bool ok, ) = platformTreasury.call{value: charged}("");
        require(ok, "TREASURY_TRANSFER");
        if (refund > 0) {
            (bool r, ) = msg.sender.call{value: refund}("");
            require(r, "REFUND_FAIL");
        }

        emit EnergyToppedUp(msg.sender, charged, energy);
    }

    /// @notice 买断。铸造 amount 份技能卡到调用者名下，永久持有、可转让、可挂单。
    /// @dev    允许一次买多份 —— 这正是二级市场做市的前提。
    function unlockSkill(uint256 skillId, uint256 amount) external payable nonReentrant {
        Skill storage s = skills[skillId];
        require(s.creator != address(0), "NO_SKILL");
        require(s.active, "INACTIVE");
        require(amount > 0 && amount <= 100, "BAD_AMOUNT");
        require(msg.value == uint256(s.unlockPriceWei) * amount, "BAD_PRICE");

        if (s.mintCap > 0) {
            require(uint256(s.minted) + amount <= s.mintCap, "MINT_CAP_REACHED");
        }
        s.minted += uint32(amount);

        _mint(msg.sender, skillId, amount, "");
        _splitRevenue(skillId, s.creator, msg.value);

        emit SkillUnlocked(msg.sender, skillId, amount, msg.value);
    }

    /// @notice 30 天订阅。租约，不铸卡、不可转让。
    function subscribeSkill(uint256 skillId) external payable nonReentrant {
        Skill storage s = skills[skillId];
        require(s.creator != address(0), "NO_SKILL");
        require(s.active, "INACTIVE");
        require(s.subscriptionPriceWei > 0, "NOT_SUBSCRIBABLE");
        require(msg.value == s.subscriptionPriceWei, "BAD_PRICE");

        uint64 nowTs = uint64(block.timestamp);
        uint64 base = subscriptionExpiry[msg.sender][skillId];
        if (base < nowTs) base = nowTs;
        uint64 newExpiry = base + 30 days;
        subscriptionExpiry[msg.sender][skillId] = newExpiry;

        _splitRevenue(skillId, s.creator, msg.value);
        emit SkillSubscribed(msg.sender, skillId, msg.value, newExpiry);
    }

    function invokeSkill(uint256 skillId, bytes32 inputHash) external nonReentrant {
        Skill storage s = skills[skillId];
        require(s.creator != address(0), "NO_SKILL");
        require(s.active, "INACTIVE");
        require(hasAccess(msg.sender, skillId), "NO_ACCESS");

        uint256 cost = uint256(s.energyCost);
        require(energyOf[msg.sender] >= cost, "LOW_ENERGY");
        unchecked { energyOf[msg.sender] -= cost; }

        emit SkillInvoked(msg.sender, skillId, s.energyCost, inputHash);
    }

    /* ───────────────────────── 视图 ───────────────────────── */

    /// @notice 权限完全由持卡量派生。卡转走，权限当场失效。
    /// @dev    旧版的 owned mapping 已彻底删除 —— 保留它会导致「卖了卡还留着钥匙」。
    function hasAccess(address user, uint256 skillId) public view returns (bool) {
        return balanceOf(user, skillId) > 0 || subscriptionExpiry[user][skillId] >= block.timestamp;
    }

    function getSkill(uint256 skillId) external view returns (Skill memory) {
        return skills[skillId];
    }

    /* ─────────────────── 全链上卡面渲染 ─────────────────── */

    function uri(uint256 skillId) public view override returns (string memory) {
        Skill memory s = skills[skillId];
        require(s.creator != address(0), "NO_SKILL");

        string memory json = string(abi.encodePacked(
            '{"name":"', s.name, ' #', skillId.toString(),
            '","description":"Orchor Skill Card. An executable AI capability, registered and settled on Injective. Holding this card grants permanent access to invoke the skill.',
            '","image":"data:image/svg+xml;base64,', Base64.encode(bytes(_svg(skillId, s))),
            '","attributes":[',
              '{"trait_type":"Rarity","value":"', _rarityName(s.rarity), '"},',
              '{"trait_type":"Energy Cost","value":', uint256(s.energyCost).toString(), '},',
              '{"trait_type":"Minted","value":', uint256(s.minted).toString(), '},',
              '{"trait_type":"Supply Cap","value":', s.mintCap == 0 ? '"Unlimited"' : uint256(s.mintCap).toString(), '},',
              '{"trait_type":"Creator","value":"', Strings.toHexString(uint160(s.creator), 20), '"}',
            ']}'
        ));

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function _svg(uint256 skillId, Skill memory s) internal pure returns (string memory) {
        string memory supply = s.mintCap == 0
            ? string(abi.encodePacked(uint256(s.minted).toString(), " / \xE2\x88\x9E"))
            : string(abi.encodePacked(uint256(s.minted).toString(), " / ", uint256(s.mintCap).toString()));

        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 480">',
            '<rect width="340" height="480" fill="#16140f"/>',
            '<rect x="6" y="6" width="328" height="468" fill="none" stroke="#c6a96c" stroke-opacity="0.7"/>',
            // 四角雕版标记
            '<g stroke="#c6a96c" stroke-width="1.5" fill="none">',
              '<path d="M14 32V14h18M326 32V14h-18M14 448v18h18M326 448v18h-18"/>',
            '</g>',
            '<text x="26" y="46" fill="#9d8c62" font-family="Georgia,serif" font-size="13" letter-spacing="2">SKILL N',
              "\xC2\xBA", ' ', _pad2(skillId), '</text>',
            _rarityBadge(s.rarity),
            // 画框
            '<rect x="26" y="62" width="288" height="150" fill="#0d0c09" stroke="#c6a96c" stroke-opacity="0.4"/>',
            _guilloche(skillId),
            // 卡名
            '<text x="170" y="252" text-anchor="middle" fill="#e8d5a0" font-family="Georgia,serif" font-size="20">',
              s.name, '</text>',
            // 菱形分隔
            '<g stroke="#5c5138"><line x1="40" y1="278" x2="155" y2="278"/><line x1="185" y1="278" x2="300" y2="278"/></g>',
            '<rect x="167" y="275" width="6" height="6" fill="#c6a96c" transform="rotate(45 170 278)"/>',
            // 三个读数
            _stat(40,  312, "UNLOCK",  string(abi.encodePacked(_ether(s.unlockPriceWei), " INJ"))),
            _stat(140, 312, "MINTED",  supply),
            _stat(240, 312, "ENERGY",  string(abi.encodePacked(uint256(s.energyCost).toString(), " PER RUN"))),
            '<text x="170" y="424" text-anchor="middle" fill="#7a6f57" font-family="Georgia,serif" font-size="11" letter-spacing="3">ORCHOR</text>',
            '<text x="170" y="444" text-anchor="middle" fill="#5c5138" font-family="Georgia,serif" font-size="10" letter-spacing="1">SETTLED ON INJECTIVE</text>',
            '</svg>'
        ));
    }

    /// 由 skillId 决定的扭索纹 —— 钞券防伪底纹的数学形态。每张卡图案唯一，无需美术。
    function _guilloche(uint256 skillId) internal pure returns (string memory) {
        uint256 a = 20 + (skillId * 7) % 26;
        uint256 b = 34 + (skillId * 13) % 30;
        return string(abi.encodePacked(
            '<g stroke="#c6a96c" fill="none" stroke-opacity="0.30" stroke-width="0.6">',
              '<circle cx="170" cy="137" r="', (28 + a).toString(), '"/>',
              '<circle cx="170" cy="137" r="', (20 + a).toString(), '"/>',
              '<circle cx="170" cy="137" r="', (12 + a).toString(), '"/>',
              '<ellipse cx="170" cy="137" rx="', b.toString(), '" ry="', (b / 2 + 8).toString(), '"/>',
              '<ellipse cx="170" cy="137" rx="', (b / 2 + 8).toString(), '" ry="', b.toString(), '"/>',
              '<ellipse cx="170" cy="137" rx="', b.toString(), '" ry="', (b / 2 + 8).toString(), '" transform="rotate(45 170 137)"/>',
              '<ellipse cx="170" cy="137" rx="', b.toString(), '" ry="', (b / 2 + 8).toString(), '" transform="rotate(-45 170 137)"/>',
            '</g>'
        ));
    }

    function _rarityBadge(Rarity r) internal pure returns (string memory) {
        (string memory fill, string memory ink) = _rarityColors(r);
        return string(abi.encodePacked(
            '<rect x="238" y="30" width="76" height="20" fill="', fill, '"',
              r == Rarity.Mythic ? ' stroke="#c6a96c"' : '', '/>',
            '<text x="276" y="44" text-anchor="middle" fill="', ink,
              '" font-family="Georgia,serif" font-size="11" letter-spacing="1">', _rarityName(r), '</text>'
        ));
    }

    /// 稀有度是金属，不是色相。青铜 → 白银 → 黄金 → 铂金 → 黑金。
    function _rarityColors(Rarity r) internal pure returns (string memory, string memory) {
        if (r == Rarity.Common)    return ("#8a6748", "#241a10");
        if (r == Rarity.Rare)      return ("#b9bfc5", "#23262a");
        if (r == Rarity.Epic)      return ("#c5a462", "#2b2007");
        if (r == Rarity.Legendary) return ("#dde0e4", "#2c2f34");
        return ("#0d0c09", "#e8d5a0"); // Mythic
    }

    function _rarityName(Rarity r) internal pure returns (string memory) {
        if (r == Rarity.Common)    return "BRONZE";
        if (r == Rarity.Rare)      return "SILVER";
        if (r == Rarity.Epic)      return "GOLD";
        if (r == Rarity.Legendary) return "PLATINUM";
        return "BLACK GOLD";
    }

    function _stat(uint256 x, uint256 y, string memory label, string memory value)
        internal pure returns (string memory)
    {
        return string(abi.encodePacked(
            '<text x="', x.toString(), '" y="', y.toString(),
              '" fill="#7a6f57" font-family="Georgia,serif" font-size="10" letter-spacing="1">', label, '</text>',
            '<text x="', x.toString(), '" y="', (y + 20).toString(),
              '" fill="#ede6d6" font-family="monospace" font-size="14">', value, '</text>'
        ));
    }

    /// wei → 最多三位小数的可读字符串。
    function _ether(uint256 weiAmount) internal pure returns (string memory) {
        uint256 whole = weiAmount / 1 ether;
        uint256 milli = (weiAmount % 1 ether) / 1e15; // 千分位
        if (milli == 0) return whole.toString();
        string memory frac = milli < 10
            ? string(abi.encodePacked("00", milli.toString()))
            : milli < 100
                ? string(abi.encodePacked("0", milli.toString()))
                : milli.toString();
        return string(abi.encodePacked(whole.toString(), ".", frac));
    }

    function _pad2(uint256 v) internal pure returns (string memory) {
        return v < 10 ? string(abi.encodePacked("0", v.toString())) : v.toString();
    }

    /* ───────────────────────── 内部 ───────────────────────── */

    function _splitRevenue(uint256 skillId, address payable creator, uint256 amount) internal {
        uint256 creatorAmt  = (amount * CREATOR_BPS)  / 10_000;
        uint256 platformAmt = (amount * PLATFORM_BPS) / 10_000;
        uint256 onchainAmt  = amount - creatorAmt - platformAmt;

        // pull-over-push：创作者若是会 revert 的合约，不应让整张卡卖不出去。
        // 失败的份额留在合约里，创作者可随时 withdraw。
        (bool ok1, ) = creator.call{value: creatorAmt, gas: 30_000}("");
        if (!ok1) pending[creator] += creatorAmt;

        (bool ok2, ) = platformTreasury.call{value: platformAmt, gas: 30_000}("");
        if (!ok2) pending[platformTreasury] += platformAmt;

        emit RevenueSplit(skillId, creator, creatorAmt, platformAmt, onchainAmt);
    }

    mapping(address => uint256) public pending;

    function withdraw() external nonReentrant {
        uint256 amt = pending[msg.sender];
        require(amt > 0, "NOTHING");
        pending[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amt}("");
        require(ok, "WITHDRAW_FAIL");
    }

    function sweepReserve(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "ZERO_TO");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "SWEEP_FAIL");
    }

    function supportsInterface(bytes4 id) public view override(ERC1155, ERC2981) returns (bool) {
        return super.supportsInterface(id);
    }

    receive() external payable {}
}
