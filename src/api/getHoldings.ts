/**
 * Returns a mock set of holdings. Ideally this would be replaced with a call to the backend
 * in the portfolio call.
 */
import { ADDRESSES } from '@/domain/tokens';
import { NETWORK_ID, type Holding, type TokenId } from '@/domain/types';

const HOLDINGS: Holding[] = [
  { address: ADDRESSES.SOL, networkId: NETWORK_ID.solana, amount: 10.000743 },
  {
    address: ADDRESSES.USDC,
    networkId: NETWORK_ID.solana,
    amount: 2_500.77,
  },
  { address: ADDRESSES.JUP, networkId: NETWORK_ID.solana, amount: 42 },
  {
    address: ADDRESSES.BONK,
    networkId: NETWORK_ID.solana,
    amount: 123_456_789.1234,
  },
  { address: ADDRESSES.JTO, networkId: NETWORK_ID.solana, amount: 0.009 },
];

export async function getHoldings(): Promise<Holding[]> {
  return HOLDINGS.map((holding) => ({ ...holding }));
}

export async function getHolding(id: TokenId): Promise<Holding> {
  const holdings = await getHoldings();
  return (
    holdings.find(
      (holding) =>
        holding.address === id.address && holding.networkId === id.networkId
    ) ?? { ...id, amount: 0 }
  );
}
