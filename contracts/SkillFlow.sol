// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SkillFlow
/// @notice Minimal AI Skills marketplace settlement contract for the SkillFlow MVP.
///         AI execution happens offchain; this contract records workflow executions
///         and splits the user payment evenly across the selected skill creators.
contract SkillFlow {
    struct Skill {
        string name;
        address payable creator;
        uint256 price;
        bool active;
    }

    uint256 public nextSkillId;
    mapping(uint256 => Skill) public skills;

    event SkillRegistered(
        uint256 indexed skillId,
        string name,
        address indexed creator,
        uint256 price
    );

    event WorkflowExecuted(
        address indexed user,
        uint256[] skillIds,
        uint256 totalPaid,
        string promptHash
    );

    event PaymentSplit(
        uint256 indexed skillId,
        address indexed creator,
        uint256 amount
    );

    /// @notice Register a new AI skill module. Anyone can register a skill for this MVP.
    function registerSkill(string calldata name, uint256 price) external returns (uint256 skillId) {
        skillId = nextSkillId++;
        skills[skillId] = Skill({
            name: name,
            creator: payable(msg.sender),
            price: price,
            active: true
        });
        emit SkillRegistered(skillId, name, msg.sender, price);
    }

    /// @notice Execute a workflow composed of `skillIds`, paying `msg.value` total.
    ///         Payment is split evenly across the selected skills' creators.
    /// @param skillIds   Ordered list of skill ids forming the workflow pipeline.
    /// @param promptHash Opaque identifier for the user prompt (hash or short string).
    function executeWorkflow(uint256[] calldata skillIds, string calldata promptHash) external payable {
        require(skillIds.length > 0, "no skills");
        require(msg.value > 0, "no payment");

        uint256 n = skillIds.length;
        uint256 share = msg.value / n;
        uint256 distributed;

        for (uint256 i = 0; i < n; i++) {
            uint256 id = skillIds[i];
            Skill memory s = skills[id];
            require(s.active, "skill inactive");

            uint256 amount = share;
            if (i == n - 1) {
                amount = msg.value - distributed;
            }
            distributed += amount;

            (bool ok, ) = s.creator.call{value: amount}("");
            require(ok, "transfer failed");

            emit PaymentSplit(id, s.creator, amount);
        }

        emit WorkflowExecuted(msg.sender, skillIds, msg.value, promptHash);
    }
}
