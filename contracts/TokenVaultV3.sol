// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./TokenVaultV2.sol";

contract TokenVaultV3 is TokenVaultV2 {

    uint256 internal withdrawalDelay;

    struct WithdrawalRequest {
        uint256 amount;
        uint256 requestTime;
    }

    mapping(address => WithdrawalRequest) internal requests;

    /* ========== INITIALIZATION (V3) ========== */

    function initializeV3() external reinitializer(3) {
        // no-op for now, placeholder for future logic
    }

    /* ========== WITHDRAWAL DELAY CONFIG ========== */

    function setWithdrawalDelay(uint256 _delaySeconds)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        withdrawalDelay = _delaySeconds;
    }

    function getWithdrawalDelay() external view returns (uint256) {
        return withdrawalDelay;
    }

    /* ========== WITHDRAWAL REQUEST FLOW ========== */

    function requestWithdrawal(uint256 amount) external {
        require(amount > 0, "zero amount");
        require(balances[msg.sender] >= amount, "low balance");

        // overwrite any previous request
        requests[msg.sender] = WithdrawalRequest({
            amount: amount,
            requestTime: block.timestamp
        });
    }

    function executeWithdrawal() external returns (uint256) {
        WithdrawalRequest memory req = requests[msg.sender];

        require(req.amount > 0, "no request");
        require(
            block.timestamp >= req.requestTime + withdrawalDelay,
            "delay not passed"
        );

        balances[msg.sender] -= req.amount;
        _totalDeposits -= req.amount;

        delete requests[msg.sender];

        token.transfer(msg.sender, req.amount);
        return req.amount;
    }

    function getWithdrawalRequest(address user)
        external
        view
        returns (uint256 amount, uint256 requestTime)
    {
        WithdrawalRequest memory req = requests[user];
        return (req.amount, req.requestTime);
    }

    /* ========== EMERGENCY WITHDRAW ========== */

    function emergencyWithdraw() external returns (uint256) {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "no balance");

        balances[msg.sender] = 0;
        _totalDeposits -= bal;

        // clear any pending request
        delete requests[msg.sender];

        token.transfer(msg.sender, bal);
        return bal;
    }

    /* ========== STORAGE GAP ========== */

    uint256[44] private __gap;
}
