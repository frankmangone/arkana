'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useSendTransaction } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';

interface NetworkConfig {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
}

const MAINNET_NETWORKS: NetworkConfig[] = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.public-rpc.com',
    blockExplorer: 'https://etherscan.io'
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'POL',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com'
  },
];

const TESTNET_NETWORKS: NetworkConfig[] = [
  {
    id: 11155111,
    name: 'Sepolia',
    symbol: 'ETH',
    rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
];

export const SUPPORTED_NETWORKS = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  ? [...MAINNET_NETWORKS, ...TESTNET_NETWORKS]
  : MAINNET_NETWORKS;

export const DEFAULT_AMOUNT = '0.001';

const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const hasMetaMaskExtension = () => {
  if (typeof window === 'undefined') return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (window as any).ethereum !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ethereum.isMetaMask === true;
};

const toHexChainId = (chainId: number): string => {
  return '0x' + chainId.toString(16);
};

const getMetaMaskDeeplink = (
  recipientAddress: string,
  amount: string,
  chainId: number
): string => {
  const hexChainId = toHexChainId(chainId);
  const amountInWei = parseEther(amount).toString();
  const encodedAddress = encodeURIComponent(recipientAddress);
  return `https://metamask.app.link/send/${encodedAddress}?chainId=${encodeURIComponent(hexChainId)}&value=${encodeURIComponent(amountInWei)}`;
};

export function useComponent(walletAddress: string) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { sendTransaction, data: txHash, isPending } = useSendTransaction();

  const [selectedChainId, setSelectedChainId] = useState(chainId);
  const [showSuccess, setShowSuccess] = useState(false);
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    if (selectedChainId === 137) {
      setAmount('10');
    } else {
      setAmount(DEFAULT_AMOUNT);
    }
  }, [selectedChainId]);

  useEffect(() => {
    if (txHash) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [txHash]);

  const selectedNetwork = SUPPORTED_NETWORKS.find((n) => n.id === selectedChainId);
  const isCorrectChain = chainId === selectedChainId;

  const handleSendTransaction = async () => {
    if (isMobile) {
      if (hasMetaMaskExtension()) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ethereum = (window as any).ethereum;

          const hexChainId = toHexChainId(selectedChainId);
          const amountInWei = parseEther(amount || DEFAULT_AMOUNT);

          const network = SUPPORTED_NETWORKS.find(n => n.id === selectedChainId);
          if (!network) {
            console.error('Selected network not found');
            return;
          }

          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: hexChainId }],
            });
          } catch (switchError: unknown) {
            if ((switchError as { code: number })?.code === 4902) {
              try {
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: hexChainId,
                    chainName: network.name,
                    rpcUrls: [network.rpcUrl],
                    blockExplorerUrls: [network.blockExplorer],
                    nativeCurrency: {
                      name: network.symbol,
                      symbol: network.symbol,
                      decimals: 18,
                    },
                  }],
                });
              } catch (addError) {
                console.error('Failed to add chain:', addError);
                return;
              }
            } else {
              console.error('Failed to switch chain:', switchError);
              return;
            }
          }

          const hash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
              from: address,
              to: walletAddress,
              value: '0x' + amountInWei.toString(16),
            }],
          });

          if (hash) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          }
        } catch (error) {
          console.error('Direct MetaMask transaction failed:', error);
          return;
        }
        return;
      }

      const deeplink = getMetaMaskDeeplink(
        walletAddress,
        amount || DEFAULT_AMOUNT,
        selectedChainId
      );

      window.location.href = deeplink;
      return;
    }

    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (!isCorrectChain && switchChain) {
      try {
        switchChain({ chainId: selectedChainId });
      } catch (error) {
        console.error('Failed to switch chain:', error);
        return;
      }
    }

    try {
      sendTransaction({
        account: address,
        to: walletAddress as `0x${string}`,
        value: parseEther(amount || DEFAULT_AMOUNT),
      });
    } catch (error) {
      console.error('Transaction failed:', error);
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
    isConnected,
    handleSendTransaction,
  };
}
