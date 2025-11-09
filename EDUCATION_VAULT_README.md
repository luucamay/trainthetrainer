# Education Vault - Octant dApp

A decentralized application that allows donors to deposit USDC into a vault, automatically puts the funds into Aave for yield generation, and sends all yield to an Education Fund address for manual distribution to trainers.

## 🎯 Core Features

### 1. **Donor Flow**
- Connect wallet (MetaMask, WalletConnect, etc.)
- Deposit USDC into the vault
- USDC is automatically deposited into Aave for yield generation
- View real-time vault statistics

### 2. **Yield Management**
- Automatic Aave integration for yield generation
- Manual yield harvesting by admin
- All yield goes directly to Education Fund address

### 3. **Admin Controls**
- Harvest yield from Aave positions
- Manual payment distribution to trainers
- Real-time dashboard with vault statistics
- Payment history tracking

## 🏗️ Architecture

```
User Deposits USDC → Education Vault → Aave Protocol → Yield Generation
                                   ↓
Education Fund ← Yield Harvest ← Admin Dashboard → Trainer Payments
```

### Smart Contract (`contracts/EducationVault.sol`)
- **Deposit Function**: Accepts USDC and deposits to Aave
- **Harvest Function**: Withdraws yield and sends to Education Fund
- **Pay Trainer Function**: Distributes funds to trainers
- **View Functions**: Get vault stats and balances

### Frontend Components
- **Education Vault Page** (`/vault`): User deposit interface
- **Admin Dashboard** (`/admin`): Yield harvesting and trainer payments
- **Real-time Data**: Live contract state updates

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open `http://localhost:5174/`
   - Connect your wallet
   - Navigate to Education Vault to deposit USDC

## 🔧 Configuration

### Contract Addresses (`src/lib/contracts.ts`)
Update these addresses for your deployment:

```typescript
export const CONTRACT_ADDRESSES = {
  8453: { // Base Mainnet
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    AAVE_POOL: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
    EDUCATION_VAULT: '0x...', // Deploy your contract here
    EDUCATION_FUND: '0x...', // Set your education fund address
  }
};
```

### Environment Variables
Create a `.env` file:
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## 📱 User Interface

### Education Vault (`/vault`)
- **Deposit Section**: Amount input, USDC approval, deposit transaction
- **Vault Stats**: Total deposited, yield earned, education fund balance
- **Live Updates**: Real-time contract state

### Admin Dashboard (`/admin`)
- **Overview Tab**: Vault statistics and status
- **Yield Management**: Harvest yield from Aave
- **Trainer Payments**: Distribute funds to trainers
- **Payment History**: Track all distributions

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Admin-only functions protected
- **Input Validation**: All inputs validated before execution
- **Emergency Functions**: Admin emergency withdraw capability

## 🧪 Testing

### Local Testing
1. Connect to a testnet (Sepolia)
2. Get test USDC from faucet
3. Test deposit → harvest → payment flow

### Contract Testing
Deploy the contract to testnet:
```bash
# Deploy EducationVault.sol to Sepolia
# Update contract addresses in configuration
# Test all functions via frontend
```

## 📊 Yield Strategy

**Aave Integration:**
- Deposits USDC to Aave V3
- Earns aUSDC (interest-bearing tokens)
- Yield compounds automatically
- Manual harvest transfers yield to Education Fund

**Estimated Returns:**
- Current Aave USDC APY: ~5.2%
- All yield goes to education funding
- Principal remains in vault for continued yield

## 🎓 Education Fund Management

**Manual Distribution Model:**
1. Yield accumulates in Education Fund address
2. Admin reviews trainer applications/invoices
3. Manual payments sent to approved trainers
4. All transactions recorded on-chain

**Payment Categories:**
- Smart Contract Training Workshops
- DeFi Education Programs
- Blockchain Development Courses
- Community Education Initiatives

## 🔗 Integration Points

### Wagmi + Viem
- Modern web3 React hooks
- Type-safe contract interactions
- Automatic wallet management

### ShadCN UI
- Accessible component library
- Professional design system
- Mobile-responsive layouts

### Zustand (Ready for expansion)
- Lightweight state management
- Ready for complex app state

## 📈 Future Enhancements

### Automated Features
- [ ] Automated yield harvesting with keeper network
- [ ] Programmable trainer payment schedules  
- [ ] Multi-signature admin controls

### Advanced Yield Strategies
- [ ] Multiple DeFi protocol integration
- [ ] Yield optimization algorithms
- [ ] Risk management features

### Governance Features
- [ ] Trainer voting on fund allocation
- [ ] Community governance for vault parameters
- [ ] Transparent reporting dashboard

## 🛠️ Development

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Web3**: Wagmi, Viem, RainbowKit  
- **UI**: ShadCN UI, Tailwind CSS
- **Smart Contracts**: Solidity, OpenZeppelin

### Project Structure
```
src/
├── components/ui/        # ShadCN components
├── pages/               # Application pages
│   ├── EducationVault.tsx
│   └── AdminDashboard.tsx
├── abis/                # Contract ABIs
├── lib/                 # Utilities and config
└── contracts/           # Solidity contracts
```

## 📞 Support

For questions about this implementation:
- Review the smart contract in `contracts/EducationVault.sol`
- Check component implementations in `src/pages/`
- Test the live interface at `http://localhost:5174/`

## 🎯 Mission

This Education Vault enables sustainable funding for blockchain education by putting donor funds to work in DeFi while preserving principal and directing all yield to educational initiatives.

**Impact**: Every USDC deposited generates ongoing yield for trainer compensation, creating a self-sustaining education funding mechanism.