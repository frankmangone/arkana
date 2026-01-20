'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useSendTransaction } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import { Coffee, Loader2, ChevronDown } from 'lucide-react';

interface TippingWidgetProps {
  authorName: string;
  walletAddress: string;
  dictionary: {
    title: string;
    description: string;
    sending: string;
    connectWallet: string;
    buyCoffee: string;
    thankYou: string;
  };
}

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

const SUPPORTED_NETWORKS = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
  ? [...MAINNET_NETWORKS, ...TESTNET_NETWORKS]
  : MAINNET_NETWORKS;

const DEFAULT_AMOUNT = '0.001'; // Default amount in native currency

// Utility to detect if we're on mobile
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Utility to check if MetaMask extension is available
const hasMetaMaskExtension = () => {
  if (typeof window === 'undefined') return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (window as any).ethereum !== 'undefined' &&
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ethereum.isMetaMask === true;
};

// Utility to convert decimal chain ID to hex
const toHexChainId = (chainId: number): string => {
  return '0x' + chainId.toString(16);
};

// Utility to create MetaMask deeplink for mobile
const getMetaMaskDeeplink = (
  recipientAddress: string,
  amount: string,
  chainId: number
): string => {
  const hexChainId = toHexChainId(chainId);
  const amountInWei = parseEther(amount).toString();
  // Try metamask.app.link format with hex chain ID and value in Wei
  const encodedAddress = encodeURIComponent(recipientAddress);
  return `https://metamask.app.link/send/${encodedAddress}?chainId=${encodeURIComponent(hexChainId)}&value=${encodeURIComponent(amountInWei)}`;
};

export default function BuyMeCoffeeWidget({ authorName, walletAddress, dictionary }: TippingWidgetProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { sendTransaction, data: txHash, isPending } = useSendTransaction();

  const [selectedChainId, setSelectedChainId] = useState(chainId);
  const [showSuccess, setShowSuccess] = useState(false);
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // Reset amount when switching chains
  useEffect(() => {
    if (selectedChainId === 137) {
      // Polygon: set to 10 POL
      setAmount('10');
    } else {
      // Other chains: set to default 0.001 ETH
      setAmount(DEFAULT_AMOUNT);
    }
  }, [selectedChainId]);

  // Show success message when transaction hash is received (published to mempool)
  useEffect(() => {
    if (txHash) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [txHash]);

  const selectedNetwork = SUPPORTED_NETWORKS.find((n) => n.id === selectedChainId);
  const isCorrectChain = chainId === selectedChainId;

  const handleSendTransaction = async () => {
    // Mobile tiered strategy
    if (isMobile) {
      // Tier 1: Try direct MetaMask injection if available
      if (hasMetaMaskExtension()) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ethereum = (window as any).ethereum;

          const hexChainId = toHexChainId(selectedChainId);
          const amountInWei = parseEther(amount || DEFAULT_AMOUNT);

          // Get the selected network
          const selectedNetwork = SUPPORTED_NETWORKS.find(n => n.id === selectedChainId);
          if (!selectedNetwork) {
            console.error('Selected network not found');
            return;
          }

          // Always ensure we're on the correct chain before sending
          try {
            console.log('Attempting to switch to chain:', selectedChainId, 'hex:', hexChainId);
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: hexChainId }],
            });
          } catch (switchError: unknown) {
            //
            console.log('Switch failed, attempting to add chain:', (switchError as { code: number })?.code);
            // Chain not found, try to add it
            if ((switchError as { code: number })?.code === 4902) {
              try {
                console.log('Adding chain:', selectedNetwork.name);
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: hexChainId,
                    chainName: selectedNetwork.name,
                    rpcUrls: [selectedNetwork.rpcUrl],
                    blockExplorerUrls: [selectedNetwork.blockExplorer],
                    nativeCurrency: {
                      name: selectedNetwork.symbol,
                      symbol: selectedNetwork.symbol,
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

          // Send transaction via direct injection
          const txHash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
              from: address,
              to: walletAddress,
              value: '0x' + amountInWei.toString(16),
            }],
          });

          if (txHash) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          }
        } catch (error) {
          console.error('Direct MetaMask transaction failed:', error);
          // Don't fall through - direct injection failed, inform user
          return;
        }
        return;
      }

      // Tier 2: Try MetaMask app deeplink (for browsers without MetaMask extension)
      const deeplink = getMetaMaskDeeplink(
        walletAddress,
        amount || DEFAULT_AMOUNT,
        selectedChainId
      );

      window.location.href = deeplink;
      return;
    }

    // Desktop flow (original behavior)
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

    return (
      <div className="w-full overflow-hidden flex flex-row">
        {/* Floating Diamonds - Left Side - AFTER content so it overlays */}
        <div className="relative w-48 h-full pointer-events-none z-10">
          {/* Base diamonds without glow */}
          <img 
            src="/images/buy-me-coffee/tokens.png" 
            className="w-full h-full object-contain mix-blend-lighten"
          alt=""
        />
        </div>

        {/* Content Container - needs to be BEFORE diamonds to be behind them */}
      <div className="px-8 py-8 md:px-12 md:py-16 flex-1 flex flex-col gap-4">
          {/* Text Content */}
          <div className="mb-8 max-w-2xl">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4 flex items-center gap-2">
            {dictionary.title}
            </h3>
            <p className="text-gray-200 text-base md:text-lg">
            {dictionary.description.replace('{authorName}', authorName)}
            </p>
          </div>
  
          {/* Form Elements */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center max-w-3xl">
            {/* Amount Input */}
            <div className="flex-1 relative">
              <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={DEFAULT_AMOUNT}
              step="0.001"
              min="0.001"
              className="w-full px-4 py-3 pr-20 bg-transparent border-2 border-[#FC7988] text-white placeholder-gray-400 focus:outline-none focus:border-[#FB8A60] transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FC7988] font-medium">
              {selectedNetwork?.symbol}
              </span>
            </div>
  
            {/* Network Selector */}
            <div className="flex-1 relative">
              <select
                value={selectedChainId}
                onChange={(e) => setSelectedChainId(Number(e.target.value))}
                className="w-full px-4 py-3 pr-10 bg-transparent border-2 border-[#FC7988] text-white focus:outline-none focus:border-[#FB8A60] transition-colors appearance-none cursor-pointer"
              >
                {SUPPORTED_NETWORKS.map((network) => (
                  <option key={network.id} value={network.id} className="bg-[#2a1810] text-white">
                    {network.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FC7988] pointer-events-none" />
            </div>
        </div>

        {/* Connect Wallet / Send Button */}
        <button
        onClick={handleSendTransaction}
        disabled={isPending}
        className="px-4 py-3 bg-gradient-to-r from-[#FC7988] to-[#FB8A60] hover:bg-[#e09a6a] self-end text-white font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
        >
        {isPending ? (
            <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {dictionary.sending}
            </>
        ) : !isConnected ? (
            dictionary.connectWallet
        ) : (
            <>
            <Coffee className="w-5 h-5" />
            {dictionary.buyCoffee
                .replace('{amount}', amount || DEFAULT_AMOUNT)
                .replace('{symbol}', selectedNetwork?.symbol || '')}
            </>
        )}
        </button>
    </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/30 max-w-3xl">
            <Coffee className="w-4 h-4 text-green-400" />
            <p className="text-green-400 text-sm font-medium">
              {dictionary.thankYou}
            </p>
          </div>
        )}
      </div>
    );
  }