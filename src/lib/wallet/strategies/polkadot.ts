import { WalletStrategy, WalletInfo, NETWORK_TYPES } from "../types";

export const polkadotStrategy: WalletStrategy = {
  name: "Polkadot",
  networkType: NETWORK_TYPES.POLKADOT,

  async isAvailable() {
    if (typeof window === "undefined") return false;

    try {
      const { web3Enable } = await import("@polkadot/extension-dapp");
      const extensions = await web3Enable("Arkana");
      return extensions.length > 0;
    } catch {
      return false;
    }
  },

  async connect(): Promise<WalletInfo> {
    const { web3Enable, web3Accounts } =
      await import("@polkadot/extension-dapp");

    const extensions = await web3Enable("Arkana");
    if (extensions.length === 0) {
      throw new Error(
        "No Polkadot wallet found. Please install Polkadot.js, Talisman, or SubWallet."
      );
    }

    const accounts = await web3Accounts();
    if (accounts.length === 0) {
      throw new Error(
        "No accounts found. Please create an account in your Polkadot wallet."
      );
    }

    return {
      address: accounts[0].address,
      networkType: "polkadot",
      walletName: accounts[0].meta.source || "Polkadot",
    };
  },

  async disconnect() {
    // Polkadot extensions don't support programmatic disconnect.
    // State cleanup is handled by the WalletProvider.
  },
};
