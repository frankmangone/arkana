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

const MAINNET_NETWORKS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' },
];

const TESTNET_NETWORKS = [
  { id: 11155111, name: 'Sepolia', symbol: 'ETH' },
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

// Utility to create MetaMask deeplink for mobile
const getMetaMaskDeeplink = (
  recipientAddress: string,
  amount: string,
  chainId: number
): string => {
  // MetaMask deeplink format: metamask://send?address=...&amount=...
  const encodedAddress = encodeURIComponent(recipientAddress);
  const encodedAmount = encodeURIComponent(amount);
  return `https://metamask.app.link/send/${encodedAddress}@${chainId}?amount=${encodedAmount}`;
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
      // Tier 1: Try MetaMask extension (if available)
      if (hasMetaMaskExtension() && isConnected) {
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
        return;
      }

      // Tier 2: Try MetaMask app deeplink
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
        <div className="basis-4/7 shrink-0">
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
