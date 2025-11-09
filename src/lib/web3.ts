import { http, createConfig } from 'wagmi'
import { base, sepolia } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'placeholder-project-id'

export const config = createConfig({
  chains: [base, sepolia],
  connectors: [
    injected(),
    metaMask(),
    safe(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'Octant Education Vault',
        description: 'USDC Vault for Education Fund',
        url: 'https://octant.build',
        icons: ['https://octant.build/favicon.ico']
      }
    }),
  ],
  transports: {
    [base.id]: http(),
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}