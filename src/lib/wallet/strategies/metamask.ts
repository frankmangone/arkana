import { WalletStrategy, WalletInfo, NETWORK_TYPES } from "../types";

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
    return !!ethereum?.isMetaMask;
  },

  async connect(): Promise<WalletInfo> {
    const ethereum = getEthereum();
    if (!ethereum) {
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
