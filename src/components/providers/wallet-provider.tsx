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
  /** Whether we've finished checking localStorage for stored wallet */
  isInitialized: boolean;
  /** Connects to wallet provider (e.g., MetaMask) and returns info. Does NOT update state. */
  connect(strategy: WalletStrategy): Promise<WalletInfo>;
  /** Call after successful backend login to persist wallet state. */
  confirmLogin(info: WalletInfo): void;
  disconnect(): void;
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  isConnecting: false,
  isInitialized: false,
  connect: async () => {
    throw new Error("WalletProvider not initialized");
  },
  confirmLogin: () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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
    setIsInitialized(true);
  }, []);

  const connect = useCallback(async (strategy: WalletStrategy): Promise<WalletInfo> => {
    setIsConnecting(true);
    try {
      const info = await strategy.connect();
      // Don't set state here - wait for confirmLogin after backend success
      return info;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const confirmLogin = useCallback((info: WalletInfo) => {
    setWallet(info);
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(info));
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    localStorage.removeItem(WALLET_STORAGE_KEY);
  }, []);

  return (
    <WalletContext.Provider
      value={{ wallet, isConnecting, isInitialized, connect, confirmLogin, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}
