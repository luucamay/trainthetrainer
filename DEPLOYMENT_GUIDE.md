# Smart Contract Deployment Guide

## Education Vault Contract Deployment

### Prerequisites

1. **Development Environment**
   ```bash
   npm install -g hardhat
   # or
   npm install -g foundry
   ```

2. **Network Configuration**
   - RPC endpoints for target networks
   - Private key for deployer account
   - Etherscan API key (for verification)

### Contract Dependencies

The contract requires OpenZeppelin contracts:

```bash
npm install @openzeppelin/contracts
```

### Deployment Steps

#### 1. Prepare Constructor Parameters

```javascript
// Base mainnet addresses
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
const AAVE_POOL_ADDRESS = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"; // Aave V3 Pool on Base
const EDUCATION_FUND_ADDRESS = "0x..."; // Your education fund address

// Sepolia testnet addresses
const USDC_ADDRESS_SEPOLIA = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
const AAVE_POOL_ADDRESS_SEPOLIA = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
const EDUCATION_FUND_ADDRESS_SEPOLIA = "0x..."; // Your testnet fund address
```

#### 2. Deploy with Hardhat

Create `deploy.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
    ```javascript
    // Get deployment parameters
    const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
    const aavePoolAddress = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"; // Aave Pool on Base
    const educationFundAddress = "0x..."; // Your education fund address

    // Deploy the contract
    const EducationVault = await ethers.getContractFactory("EducationVault");
    const vault = await EducationVault.deploy(
        usdcAddress,
        aavePoolAddress,
        educationFundAddress
    );

    await vault.deployed();

    console.log("EducationVault deployed to:", vault.address);
    console.log("Constructor args:", [usdcAddress, aavePoolAddress, educationFundAddress]);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

Deploy:
```bash
npx hardhat run deploy.js --network base
```

#### 3. Deploy with Foundry

Create `script/Deploy.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/EducationVault.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // Base USDC
        address aavePool = 0xA238Dd80C259a72e81d7e4664a9801593F98d1c5; // Aave Pool on Base
        address educationFund = 0x...; // Your education fund address

        EducationVault vault = new EducationVault(usdc, aavePool, educationFund);

        console.log("EducationVault deployed at:", address(vault));

        vm.stopBroadcast();
    }
}
```

Deploy:
```bash
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify
```

### Post-Deployment Setup

#### 1. Update Frontend Configuration

Update `src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  8453: { // Base Mainnet
    EDUCATION_VAULT: '0x...' as `0x${string}`, // Your deployed address
    EDUCATION_FUND: '0x...' as `0x${string}`, // Your education fund address
  }
};
```

#### 2. Verify Contract on Etherscan

With Hardhat:
```bash
npx hardhat verify --network base DEPLOYED_ADDRESS "USDC_ADDRESS" "AAVE_POOL_ADDRESS" "EDUCATION_FUND_ADDRESS"
```

With Foundry:
```bash
forge verify-contract --chain-id 8453 DEPLOYED_ADDRESS contracts/EducationVault.sol:EducationVault --etherscan-api-key $BASESCAN_KEY
```

#### 3. Set Up Education Fund Address

The education fund address should be:
1. **Multi-sig wallet** for security
2. **Controlled by education team**
3. **Transparent for community oversight**

### Testing Deployment

#### 1. Contract Interaction

Test basic functions:

```javascript
const vault = await ethers.getContractAt("EducationVault", deployedAddress);

// Check initial state
console.log("Total deposited:", await vault.getTotalDeposited());
console.log("Yield earned:", await vault.getYieldEarned());
console.log("Education fund balance:", await vault.getEducationFundBalance());
```

#### 2. Frontend Integration

1. Update contract address in configuration
2. Test wallet connection
3. Test USDC approval flow
4. Test deposit transaction
5. Test admin functions (harvest, pay trainer)

### Security Considerations

#### 1. Admin Key Management
- Use hardware wallet for admin functions
- Consider multi-sig for admin role
- Regular key rotation procedures

#### 2. Contract Upgrades
- Current contract is not upgradeable
- For upgrades, deploy new contract and migrate funds
- Consider proxy pattern for future versions

#### 3. Emergency Procedures
- Emergency withdraw function for admin
- Contract pause functionality
- Incident response plan

### Network-Specific Notes

#### Base Mainnet
- Very low gas costs for deployment (~$1-5)
- Real USDC and Aave integration
- Production-ready L2 environment
- Fast transaction finality

#### Sepolia Testnet
- Free deployment with testnet ETH
- Testnet USDC from faucets
- Safe testing environment

#### Polygon/Arbitrum
- Alternative L2 options
- Different token addresses
- Update contract addresses accordingly

### Monitoring

#### 1. Contract Events
Monitor these events:
- `Deposit(address user, uint256 amount)`
- `YieldHarvested(uint256 yieldAmount, uint256 timestamp)`
- `TrainerPaid(address trainer, uint256 amount)`

#### 2. Health Checks
- Regular balance reconciliation
- Aave position monitoring
- Education fund balance tracking

#### 3. Analytics Dashboard
Consider building:
- Total value locked (TVL)
- Yield generation rate
- Trainer payment history
- Community impact metrics

### Troubleshooting

#### Common Issues:

1. **Deployment Fails**
   - Check network configuration
   - Verify account has sufficient ETH for gas
   - Confirm constructor parameters

2. **Frontend Connection Issues**
   - Verify contract address is correct
   - Check ABI matches deployed contract
   - Confirm network ID matches

3. **Transaction Failures**
   - Check gas limits
   - Verify token approvals
   - Confirm admin permissions

### Next Steps After Deployment

1. **Announce Contract Address**
   - Share with community
   - Add to documentation
   - Update all references

2. **Initial Funding**
   - Test with small amount first
   - Verify yield generation
   - Confirm harvest functionality

3. **Community Onboarding**
   - Create user guides
   - Host demonstration sessions
   - Gather feedback for improvements