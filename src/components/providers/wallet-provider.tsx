"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { WalletInfo, WalletStrategy } from "@/lib/wallet/types";

const WALLET_STORAGE_KEY = "arkana_wallet";

interface WalletContextType {
  wallet: WalletInfo | null;
  isConnecting: boolean;
  connect(strategy: WalletStrategy): Promise<void>;
  disconnect(): void;
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Restore wallet from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(WALLET_STORAGE_KEY);
    if (stored) {
      try {
        setWallet(JSON.parse(stored));
      } catch {
        localStorage.removeItem(WALLET_STORAGE_KEY);
      }
    }
  }, []);

  const connect = useCallback(async (strategy: WalletStrategy) => {
    setIsConnecting(true);
    try {
      const info = await strategy.connect();
      setWallet(info);
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(info));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    localStorage.removeItem(WALLET_STORAGE_KEY);
  }, []);

  return (
    <WalletContext.Provider
      value={{ wallet, isConnecting, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}
