"use client";

import { useState } from "react";
import { parseUnits, encodeFunctionData } from "viem";
import { useWallet } from "@/components/providers/wallet-provider";
import { useParams, useRouter } from "next/navigation";
import { trackEvent, EVENTS } from "@/lib/analytics";

interface NetworkConfig {
  id: number;
  name: string;
  symbol: string;
  usdcAddress: `0x${string}`;
  rpcUrl: string;
  blockExplorer: string;
}

const MAINNET_NETWORKS: NetworkConfig[] = [
  {
    id: 42161,
    name: "Arbitrum",
    symbol: "USDC",
    usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
  },
  {
    id: 8453,
    name: "Base",
    symbol: "USDC",
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
  },
  {
    id: 137,
    name: "Polygon",
    symbol: "USDC",
    usdcAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
  },
  {
    id: 1,
    name: "Ethereum",
    symbol: "USDC",
    usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    rpcUrl: "https://eth.public-rpc.com",
    blockExplorer: "https://etherscan.io",
  },
];

const TESTNET_NETWORKS: NetworkConfig[] = [
  {
    id: 11155111,
    name: "Sepolia",
    symbol: "USDC",
    usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    rpcUrl: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    blockExplorer: "https://sepolia.etherscan.io",
  },
];

export const SUPPORTED_NETWORKS =
  process.env.NEXT_PUBLIC_DEV_MODE === "true"
    ? [...MAINNET_NETWORKS, ...TESTNET_NETWORKS]
    : MAINNET_NETWORKS;

export const DEFAULT_AMOUNT = "3";

// ERC-20 transfer ABI (minimal)
const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const toHexChainId = (chainId: number): string => {
  return "0x" + chainId.toString(16);
};

export function useComponent(walletAddress: string) {
  const { wallet } = useWallet();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  const [selectedChainId, setSelectedChainId] = useState(
    SUPPORTED_NETWORKS[0].id
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [isPending, setIsPending] = useState(false);

  const isLoggedIn = !!wallet;

  const selectedNetwork = SUPPORTED_NETWORKS.find(
    (n) => n.id === selectedChainId
  );

  const handleSendTransaction = async () => {
    // If not logged in, redirect to login page
    if (!isLoggedIn) {
      const currentPath = window.location.pathname;
      const returnUrl = encodeURIComponent(`${currentPath}#buy-me-coffee`);
      router.push(`/${lang}/login?redirect=${returnUrl}`);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      console.error("No ethereum provider found");
      return;
    }

    const network = SUPPORTED_NETWORKS.find((n) => n.id === selectedChainId);
    if (!network) {
      console.error("Selected network not found");
      return;
    }

    setIsPending(true);

    try {
      // Switch to the correct chain
      const hexChainId = toHexChainId(selectedChainId);
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChainId }],
        });
      } catch (switchError: unknown) {
        if ((switchError as { code: number })?.code === 4902) {
          // Chain not added, try to add it
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexChainId,
                chainName: network.name,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.blockExplorer],
                nativeCurrency: {
                  name: network.symbol,
                  symbol: network.symbol,
                  decimals: 18,
                },
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      // USDC has 6 decimals
      const amountInSmallestUnit = parseUnits(amount || DEFAULT_AMOUNT, 6);

      // Encode the ERC-20 transfer call
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [walletAddress as `0x${string}`, amountInSmallestUnit],
      });

      // Send the transaction using the logged-in wallet
      const hash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet.address,
            to: network.usdcAddress,
            data,
          },
        ],
      });

      if (hash) {
        trackEvent(EVENTS.COFFEE_PURCHASED, {
          amount: Number(amount),
          chain: network.name,
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  return {
    amount,
    setAmount,
    selectedChainId,
    setSelectedChainId,
    selectedNetwork,
    showSuccess,
    isPending,
    isLoggedIn,
    handleSendTransaction,
  };
}
