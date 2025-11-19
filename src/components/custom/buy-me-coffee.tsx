'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useSendTransaction } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Coffee, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuyMeCoffeeProps {
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

export function BuyMeCoffee({ authorName, walletAddress, dictionary }: BuyMeCoffeeProps) {
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
    <div className="mt-12 pt-8 border border-purple-700/80 bg-purple-950/40 p-6">
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <div className="basis-4/7 shrink-0 pr-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-purple-400">
            <Coffee className="w-6 h-6" />
            {dictionary.title}
          </h3>
          <span className="text-neutral-400 text-white text-md">
            {dictionary.description.replace('{authorName}', authorName)}
          </span>
        </div>

        <div className="basis-3/7 shrink-0 mt-8 sm:mt-0 w-full sm:w-auto space-y-3">
          {/* Amount Input */}
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={DEFAULT_AMOUNT}
              step="0.001"
              min="0.001"
              className="flex-1 sm:flex-initial px-3 py-1.5 text-sm font-medium bg-neutral-800 border border-purple-700 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <span className="px-3 py-1.5 text-sm font-medium text-neutral-300">
              {selectedNetwork?.symbol}
            </span>
          </div>

          {/* Chain Selector */}
          <div className="flex gap-2 flex-wrap mt-8 sm:mt-0">
            {SUPPORTED_NETWORKS.map((network) => (
              <button
                key={network.id}
                onClick={() => setSelectedChainId(network.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                  selectedChainId === network.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                )}
              >
                {network.name}
              </button>
            ))}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendTransaction}
            disabled={isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {dictionary.sending}
              </>
            ) : !isConnected ? (
              dictionary.connectWallet
            ) : (
              <>
                <Coffee className="w-4 h-4 mr-2" />
                {dictionary.buyCoffee
                  .replace('{amount}', amount || DEFAULT_AMOUNT)
                  .replace('{symbol}', selectedNetwork?.symbol || '')}
              </>
            )}
          </Button>

          {/* Success Message */}
          {showSuccess && (
            <p className="text-green-400 text-xs text-center font-medium">
              {dictionary.thankYou}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
