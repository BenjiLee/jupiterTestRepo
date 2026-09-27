export type Address = string;

export const NETWORK_ID = {
  ethereum: 1,
  solana: 1399811149,
} as const;

export type NetworkId = (typeof NETWORK_ID)[keyof typeof NETWORK_ID];

export type TokenId = {
  address: Address;
  networkId: NetworkId;
};

export type TokenPrice = TokenId & {
  priceUsd: number;
};

export type Holding = TokenId & {
  amount: number;
};

export type Token = TokenId & {
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
};
