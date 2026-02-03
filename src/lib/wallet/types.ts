export const NETWORK_TYPES = {
  EVM: "evm",
  POLKADOT: "polkadot",
};

export type NetworkType = (typeof NETWORK_TYPES)[keyof typeof NETWORK_TYPES];

export interface WalletInfo {
  address: string;
  networkType: NetworkType;
  walletName: string;
}

export interface WalletStrategy {
  name: string;
  networkType: NetworkType;
  isAvailable(): Promise<boolean>;
  connect(): Promise<WalletInfo>;
  disconnect(): Promise<void>;
}
