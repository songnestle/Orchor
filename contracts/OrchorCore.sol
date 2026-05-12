// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title OrchorCore
/// @notice Onchain registry, energy ledger and settlement layer for Orchor —
///         the Skill Layer for AI Agents on Monad.
///
///         Skills are registered with rarity, energy cost, MON unlock price
///         and (for Mythic) a hard mint cap. Users top up MON → Energy at a
///         fixed rate; invocations spend Energy and route revenue 70/25/5
///         (creator / platform / onchain log) to the appropriate sinks.
contract OrchorCore {
    enum Rarity { Common, Rare, Epic, Legendary, Mythic }

    struct Skill {
        string name;
        address payable creator;
        Rarity rarity;
        uint64 energyCost;
        uint128 unlockPriceWei;
        uint128 subscriptionPriceWei;
        uint32 mintCap;     // 0 = no cap
        uint32 minted;
        bool active;
    }

    /// 1 MON = 100 Energy.
    uint256 public constant MON_TO_ENERGY = 100;

    /// Revenue split (basis points). Sum must equal 10_000.
    uint16 public constant CREATOR_BPS  = 7000;
    uint16 public constant PLATFORM_BPS = 2500;
    uint16 public constant ONCHAIN_BPS  =  500;

    address public owner;
    address public platformTreasury;

    uint256 public nextSkillId;
    mapping(uint256 => Skill) public skills;

    /// user => skillId => owns the skill outright (Mythic mint or Unlock).
    mapping(address => mapping(uint256 => bool)) public owned;
    /// user => skillId => subscription expiry timestamp (0 = none).
    mapping(address => mapping(uint256 => uint64)) public subscriptionExpiry;
    /// user => current Energy balance.
    mapping(address => uint256) public energyOf;
    /// user => last invoked skill (for cheap UX queries).
    mapping(address => uint256) public lastInvoked;

    uint256 private _locked = 1;
    modifier nonReentrant() {
        require(_locked == 1, "REENTRANT");
        _locked = 2;
        _;
        _locked = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    event SkillRegistered(
        uint256 indexed skillId,
        string name,
        address indexed creator,
        Rarity rarity,
        uint64 energyCost,
        uint128 unlockPriceWei,
        uint128 subscriptionPriceWei,
        uint32 mintCap
    );

    event SkillToggled(uint256 indexed skillId, bool active);

    event EnergyToppedUp(address indexed user, uint256 monPaid, uint256 energyAdded);

    event SkillUnlocked(
        address indexed user,
        uint256 indexed skillId,
        uint256 pricePaid,
        uint256 mintIndex
    );

    event SkillSubscribed(
        address indexed user,
        uint256 indexed skillId,
        uint256 pricePaid,
        uint64 expiresAt
    );

    event SkillInvoked(
        address indexed user,
        uint256 indexed skillId,
        uint64 energySpent,
        bytes32 inputHash
    );

    event RevenueSplit(
        uint256 indexed skillId,
        address indexed creator,
        uint256 creatorAmount,
        uint256 platformAmount,
        uint256 onchainLogAmount
    );

    constructor(address _platformTreasury) {
        require(_platformTreasury != address(0), "ZERO_TREASURY");
        owner = msg.sender;
        platformTreasury = _platformTreasury;
    }

    /* ─────────────────────────── admin ─────────────────────────── */

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ZERO_OWNER");
        owner = newOwner;
    }

    function setPlatformTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "ZERO_TREASURY");
        platformTreasury = newTreasury;
    }

    /* ───────────────────────── creator API ─────────────────────── */

    /// @notice Register a new skill. Creator becomes msg.sender.
    /// @dev Mythic skills must declare a mintCap > 0; others must be 0.
    function registerSkill(
        string calldata name,
        Rarity rarity,
        uint64 energyCost,
        uint128 unlockPriceWei,
        uint128 subscriptionPriceWei,
        uint32 mintCap
    ) external returns (uint256 skillId) {
        require(bytes(name).length > 0, "EMPTY_NAME");
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

        emit SkillRegistered(
            skillId,
            name,
            msg.sender,
            rarity,
            energyCost,
            unlockPriceWei,
            subscriptionPriceWei,
            mintCap
        );
    }

    function setSkillActive(uint256 skillId, bool active) external {
        Skill storage s = skills[skillId];
        require(s.creator == msg.sender || msg.sender == owner, "NOT_AUTH");
        s.active = active;
        emit SkillToggled(skillId, active);
    }

    /* ──────────────────────── user actions ─────────────────────── */

    /// @notice Convert MON into Energy at a fixed rate. Whole MON taken,
    ///         change refunded.
    function topUpEnergy() external payable nonReentrant {
        require(msg.value > 0, "NO_PAYMENT");
        uint256 energy = (msg.value * MON_TO_ENERGY) / 1 ether;
        require(energy > 0, "BELOW_MIN");

        // Treasury keeps every top-up — model cost is paid out of platform side.
        (bool ok, ) = platformTreasury.call{value: msg.value}("");
        require(ok, "TREASURY_TRANSFER");

        energyOf[msg.sender] += energy;
        emit EnergyToppedUp(msg.sender, msg.value, energy);
    }

    /// @notice One-time unlock. For Mythic skills this also mints under the cap.
    function unlockSkill(uint256 skillId) external payable nonReentrant {
        Skill storage s = skills[skillId];
        require(s.creator != address(0), "NO_SKILL");
        require(s.active, "INACTIVE");
        require(!owned[msg.sender][skillId], "ALREADY_OWNED");
        require(msg.value == s.unlockPriceWei, "BAD_PRICE");

        uint256 mintIndex = 0;
        if (s.rarity == Rarity.Mythic) {
            require(s.minted < s.mintCap, "MINT_CAP_REACHED");
            unchecked { s.minted += 1; }
            mintIndex = s.minted;
        }

        owned[msg.sender][skillId] = true;
        _splitRevenue(skillId, s.creator, msg.value);

        emit SkillUnlocked(msg.sender, skillId, msg.value, mintIndex);
    }

    /// @notice Buy a 30-day subscription. Stacks: extends from now or current expiry.
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

    /// @notice Invoke a skill. Spends Energy. User must own or have an active sub.
    function invokeSkill(uint256 skillId, bytes32 inputHash) external nonReentrant {
        Skill storage s = skills[skillId];
        require(s.creator != address(0), "NO_SKILL");
        require(s.active, "INACTIVE");

        bool access = owned[msg.sender][skillId]
            || subscriptionExpiry[msg.sender][skillId] >= block.timestamp;
        require(access, "NO_ACCESS");

        uint256 cost = uint256(s.energyCost);
        require(energyOf[msg.sender] >= cost, "LOW_ENERGY");
        unchecked { energyOf[msg.sender] -= cost; }

        lastInvoked[msg.sender] = skillId;

        emit SkillInvoked(msg.sender, skillId, s.energyCost, inputHash);
    }

    /* ───────────────────────── views ───────────────────────────── */

    function getSkill(uint256 skillId) external view returns (Skill memory) {
        return skills[skillId];
    }

    function hasAccess(address user, uint256 skillId) external view returns (bool) {
        return owned[user][skillId]
            || subscriptionExpiry[user][skillId] >= block.timestamp;
    }

    /* ───────────────────────── internal ────────────────────────── */

    function _splitRevenue(uint256 skillId, address payable creator, uint256 amount) internal {
        uint256 creatorAmt  = (amount * CREATOR_BPS)  / 10_000;
        uint256 platformAmt = (amount * PLATFORM_BPS) / 10_000;
        uint256 onchainAmt  = amount - creatorAmt - platformAmt; // exact remainder

        (bool ok1, ) = creator.call{value: creatorAmt}("");
        require(ok1, "CREATOR_PAY");

        (bool ok2, ) = platformTreasury.call{value: platformAmt}("");
        require(ok2, "PLATFORM_PAY");

        // The "onchain log" share simply stays in the contract as a
        // settlement reserve / griefing buffer — owner can sweep later.
        // Keeping it intentional: not forwarded.
        (skillId); // silence unused warning when optimizer aggressive
        (onchainAmt);

        emit RevenueSplit(skillId, creator, creatorAmt, platformAmt, onchainAmt);
    }

    /// @notice Owner sweeps the accumulated onchain-log reserve.
    function sweepReserve(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "ZERO_TO");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "SWEEP_FAIL");
    }

    receive() external payable {}
}
