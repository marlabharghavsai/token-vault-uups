// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./TokenVaultV1.sol";

contract TokenVaultV2 is TokenVaultV1 {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 internal yieldRate;     // basis points
    bool internal depositsPaused;

    mapping(address => uint256) internal lastClaim;

    /* ========== INITIALIZATION (V2) ========== */

    function initializeV2() external reinitializer(2) {
        // Grant pauser role to the admin performing the upgrade
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    /* ========== DEPOSIT OVERRIDE ========== */

    function deposit(uint256 amount) public override {
        require(!depositsPaused, "deposits paused");
        super.deposit(amount);
    }

    /* ========== YIELD LOGIC ========== */

    function setYieldRate(uint256 _rate)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        yieldRate = _rate;
    }

    function getYieldRate() external view returns (uint256) {
        return yieldRate;
    }

    function claimYield() external returns (uint256) {
        uint256 last = lastClaim[msg.sender];

        // First claim just initializes timestamp
        if (last == 0) {
            lastClaim[msg.sender] = block.timestamp;
            return 0;
        }

        uint256 elapsed = block.timestamp - last;
        uint256 reward =
            (balances[msg.sender] * yieldRate * elapsed) /
            (365 days * 10000);

        lastClaim[msg.sender] = block.timestamp;
        balances[msg.sender] += reward;
        _totalDeposits += reward;

        return reward;
    }

    function getUserYield(address user)
        external
        view
        returns (uint256)
    {
        uint256 last = lastClaim[user];
        if (last == 0) return 0;

        uint256 elapsed = block.timestamp - last;
        return
            (balances[user] * yieldRate * elapsed) /
            (365 days * 10000);
    }

    /* ========== PAUSE CONTROL ========== */

    function pauseDeposits() external onlyRole(PAUSER_ROLE) {
        depositsPaused = true;
    }

    function unpauseDeposits() external onlyRole(PAUSER_ROLE) {
        depositsPaused = false;
    }

    function isDepositsPaused() external view returns (bool) {
        return depositsPaused;
    }

    /* ========== STORAGE GAP ========== */

    uint256[47] private __gap;
}
