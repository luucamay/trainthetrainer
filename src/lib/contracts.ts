// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Base Mainnet (Production)
  8453: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
    AAVE_POOL: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5' as `0x${string}`,
    EDUCATION_VAULT: '0x017C6C1455819F0051614bc11fB247dD6AF249E8' as `0x${string}`, // Will be updated after deployment
    EDUCATION_FUND: '0x9c6bd82629e7039f1308a56508636e3e425576bf' as `0x${string}`,
  },
  // Sepolia Testnet
  11155111: {
    USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8' as `0x${string}`,
    AAVE_POOL: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951' as `0x${string}`,
    EDUCATION_VAULT: '0x017C6C1455819F0051614bc11fB247dD6AF249E8' as `0x${string}`,
    EDUCATION_FUND: '0x9c6bd82629e7039f1308a56508636e3e425576bf' as `0x${string}`,
  },
} as const;

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES;

export const SUPPORTED_CHAINS = Object.keys(CONTRACT_ADDRESSES).map(Number) as SupportedChainId[];