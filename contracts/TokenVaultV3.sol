contract TokenVaultV3 is TokenVaultV2 {

    uint256 internal withdrawalDelay;

    struct WithdrawalRequest {
        uint256 amount;
        uint256 requestTime;
    }

    mapping(address => WithdrawalRequest) internal requests;

    function requestWithdrawal(uint256 amount) external {
        require(balances[msg.sender] >= amount, "low balance");
        requests[msg.sender] = WithdrawalRequest(amount, block.timestamp);
    }

    function executeWithdrawal() external returns (uint256) {
        WithdrawalRequest memory req = requests[msg.sender];
        require(req.amount > 0, "no request");
        require(block.timestamp >= req.requestTime + withdrawalDelay, "delay");

        balances[msg.sender] -= req.amount;
        _totalDeposits -= req.amount;
        delete requests[msg.sender];

        token.transfer(msg.sender, req.amount);
        return req.amount;
    }

    function emergencyWithdraw() external returns (uint256) {
        uint256 bal = balances[msg.sender];
        balances[msg.sender] = 0;
        _totalDeposits -= bal;
        token.transfer(msg.sender, bal);
        return bal;
    }

    uint256[44] private __gap;
}
