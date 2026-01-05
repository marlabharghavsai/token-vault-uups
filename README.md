# TokenVault – Production-Grade UUPS Upgradeable Smart Contract System
## Overview
- This repository implements a production-grade upgradeable TokenVault protocol using the UUPS (Universal Upgradeable Proxy Standard) pattern.
- The system demonstrates a full upgrade lifecycle from V1 → V2 → V3, preserving state, enforcing access control, and maintaining storage layout integrity.
- The project is designed to reflect real-world DeFi upgrade patterns used by production protocols and passes strict security and upgrade validations.

## Objectives Achieved
- Secure UUPS upgradeable architecture
- Safe initialization and reinitialization
- Storage layout preservation across upgrades
- Role-based access control for upgrades and pausing
- Cross-version state migration
- Comprehensive automated test coverage
- Deployment and upgrade scripts
- Submission-ready automation via submission.yml

## Architecture
### Upgrade Pattern
- UUPS Proxy Pattern using OpenZeppelin
- Proxy holds state
- Logic contracts (V1, V2, V3) are upgradeable
- Upgrade authorization enforced via UPGRADER_ROLE

### Security Principles
- No constructors in implementation contracts
- Initializers protected using initializer / reinitializer
- _disableInitializers() used in constructors
- Explicit role separation
- Storage gaps reserved for future upgrades

## Project Structure
```
token-vault-uups
├── contracts/
│   ├── TokenVaultV1.sol
│   ├── TokenVaultV2.sol
│   ├── TokenVaultV3.sol
│   └── mocks/
│       └── MockERC20.sol
├── test/
│   ├── TokenVaultV1.test.js
│   ├── upgrade-v1-to-v2.test.js
│   ├── upgrade-v2-to-v3.test.js
│   └── security.test.js
├── scripts/
│   ├── deploy-v1.js
│   ├── upgrade-to-v2.js
│   └── upgrade-to-v3.js
├── submission.yml
├── hardhat.config.js
├── package.json
└── README.md
```

## Contract Versions
### TokenVaultV1
- Core functionality
  - Deposit & withdraw ERC20 tokens
  - Deposit fee (basis points)
  - Tracks user balances & total deposits
  - Upgrade authorization via UPGRADER_ROLE

### TokenVaultV2
- Enhancements
  - Yield generation (APR in basis points)
  - Time-based yield calculation
  - Claimable yield (non-compounding)
  - Deposit pause/unpause functionality
  - PAUSER_ROLE introduced
  - initializeV2() reinitializer

### TokenVaultV3
- Advanced controls
  - Withdrawal delay mechanism
  - Withdrawal request & execution flow
  - Emergency withdrawal (bypasses delay)
  - initializeV3() reinitializer
  - Preserves all prior state

## Access Control Roles
```
Role	                    Responsibility
DEFAULT_ADMIN_ROLE	  Manage roles and critical configuration
UPGRADER_ROLE	        Authorize contract upgrades
PAUSER_ROLE	          Pause/unpause deposits (V2+)
```
## Storage Layout Strategy
- Never reorders or removes state variables
- New variables are always appended
- Storage gaps (uint256[N] __gap) included in every version
- Gap size reduced as variables are added
- Prevents storage collisions during upgrades

## Testing Strategy
### Test Coverage Includes
- Initialization correctness
- Deposit fee calculation
- Withdraw limits
- Upgrade state preservation
- Yield calculation accuracy
- Withdrawal delay enforcement
- Emergency withdrawals
- Unauthorized access prevention
- Storage layout integrity
- Function selector collision prevention

## Run Tests
```
npx hardhat test
```
- All required tests pass successfully.

## Setup & Usage
### Install Dependencies
```
npm install
```
### Compile Contracts
```
npx hardhat compile
```
### Run Tests
```
npx hardhat test
```

## Deployment & Upgrades
### Deploy V1 Proxy
```
npx hardhat run scripts/deploy-v1.js
```
### Upgrade to V2
```
npx hardhat run scripts/upgrade-to-v2.js
```
### Upgrade to V3
```
npx hardhat run scripts/upgrade-to-v3.js
```
## Automated Evaluation
- The repository includes a submission.yml file for automated evaluation:
```
setup:
  - npm install

test:
  - npx hardhat compile
  - npx hardhat test
```

## Known Limitations
- Yield source is simulated (no external protocol integration)
- Emergency withdrawals are user-initiated only
- No frontend UI (smart contract focus)
- Coverage below 100% due to upgrade-specific logic (acceptable)

## Conclusion
- This project demonstrates production-ready upgradeable smart contract engineering, addressing the exact challenges faced by real-world DeFi protocols:
- Secure upgradability
- State preservation
- Storage safety
- Access control
- Defensive initialization
- It is fully functional, secure, tested, and submission-ready.

## License
- MIT
