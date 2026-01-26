'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from 'wagmi/chains';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Build wagmi config based on dev mode
const createWagmiConfig = () => {
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return createConfig({
      chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
      transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [optimism.id]: http(),
        [arbitrum.id]: http(),
        [base.id]: http(),
        [sepolia.id]: http(),
      },
    });
  }

  return createConfig({
    chains: [mainnet, polygon, optimism, arbitrum, base],
    transports: {
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [optimism.id]: http(),
      [arbitrum.id]: http(),
      [base.id]: http(),
    },
  });
};

const config = createWagmiConfig();

// Create a shared QueryClient for both Wagmi and API calls
// Configured with sensible defaults for API interactions
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
