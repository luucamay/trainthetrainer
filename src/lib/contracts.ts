// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Base mainnet addresses
  8453: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`, // Base USDC
    AAVE_POOL: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5' as `0x${string}`, // Aave V3 Pool on Base
    EDUCATION_VAULT: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Deploy this
    EDUCATION_FUND: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Set this address
  },
  // Sepolia testnet addresses
  11155111: {
    USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8' as `0x${string}`,
    AAVE_POOL: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951' as `0x${string}`,
    EDUCATION_VAULT: '0x1234567890123456789012345678901234567890' as `0x${string}`, // Mock for testing UI
    EDUCATION_FUND: '0x9876543210987654321098765432109876543210' as `0x${string}`, // Mock for testing UI
  }
} as const;

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES;

export const SUPPORTED_CHAINS = Object.keys(CONTRACT_ADDRESSES).map(Number) as SupportedChainId[];