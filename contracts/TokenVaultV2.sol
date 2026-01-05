contract TokenVaultV2 is TokenVaultV1 {

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 internal yieldRate;
    bool internal depositsPaused;

    mapping(address => uint256) internal lastClaim;

    function setYieldRate(uint256 _rate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        yieldRate = _rate;
    }

    function claimYield() external returns (uint256) {
        uint256 elapsed = block.timestamp - lastClaim[msg.sender];
        uint256 reward =
            (balances[msg.sender] * yieldRate * elapsed) /
            (365 days * 10000);

        lastClaim[msg.sender] = block.timestamp;
        balances[msg.sender] += reward;
        _totalDeposits += reward;

        return reward;
    }

    function pauseDeposits() external onlyRole(PAUSER_ROLE) {
        depositsPaused = true;
    }

    function unpauseDeposits() external onlyRole(PAUSER_ROLE) {
        depositsPaused = false;
    }

    function isDepositsPaused() external view returns (bool) {
        return depositsPaused;
    }

    uint256[47] private __gap;
}
