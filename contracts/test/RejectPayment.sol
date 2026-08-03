// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IOrchorRegister {
    function registerSkill(
        string calldata name,
        uint8 rarity,
        uint64 energyCost,
        uint128 unlockPriceWei,
        uint128 subscriptionPriceWei,
        uint32 mintCap
    ) external returns (uint256);
}

/// @notice 测试替身：一个拒收原生币的创作者地址。
///         旧版 OrchorCore 用 push 分账，遇到这种创作者会让整张卡永久无法解锁 ——
///         任何人都能靠它 DoS 自己那张卡，正常的多签钱包也可能因 gas 不足而中招。
contract RejectPayment {
    function register(address core, string calldata name, uint128 price) external {
        IOrchorRegister(core).registerSkill(name, 1, 5, price, 0, 0);
    }

    receive() external payable {
        revert("NOPE");
    }
}
