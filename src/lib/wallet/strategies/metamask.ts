import { WalletStrategy, WalletInfo, NETWORK_TYPES } from "../types";
import { isMobile, openMetaMaskApp } from "../utils/mobile";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEthereum(): any {
  if (typeof window !== "undefined") {
    // Check https://eips.ethereum.org/EIPS/eip-1193 for more information about the Ethereum Provider API
    // Although, `window.ethereum` is a convention that is not part of the EIP-1193 specification
    return (window as unknown as Record<string, unknown>).ethereum;
  }
  return undefined;
}

export const metamaskStrategy: WalletStrategy = {
  name: "MetaMask",
  networkType: NETWORK_TYPES.EVM,

  async isAvailable() {
    const ethereum = getEthereum();
    // On mobile, MetaMask might be available via deep link even if extension is not detected
    if (isMobile()) {
      return true; // Allow attempting connection on mobile (will use deep link if needed)
    }
    return !!ethereum?.isMetaMask;
  },

  async connect(): Promise<WalletInfo> {
    const ethereum = getEthereum();
    
    // On mobile, if MetaMask extension is not available, redirect to app
    if (isMobile() && !ethereum?.isMetaMask) {
      openMetaMaskApp();
      throw new Error(
        "Please open this page in MetaMask mobile browser or install MetaMask extension"
      );
    }
    
    if (!ethereum) {
      if (isMobile()) {
        openMetaMaskApp();
        throw new Error(
          "Please open this page in MetaMask mobile browser or install MetaMask extension"
        );
      }
      throw new Error(
        "MetaMask is not installed. Please install the MetaMask browser extension."
      );
    }

    const accounts = (await ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error(
        "No accounts found. Please unlock MetaMask and try again."
      );
    }

    return {
      address: accounts[0],
      networkType: "evm",
      walletName: "MetaMask",
    };
  },

  async disconnect() {
    // MetaMask doesn't support programmatic disconnect.
    // State cleanup is handled by the WalletProvider.
  },
};
