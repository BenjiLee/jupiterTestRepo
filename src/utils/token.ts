import { NETWORK_ID, type NetworkId, type TokenId } from '@/domain/types';

/**
 * Converts the TokenId to a string
 *
 * @param id - Example: {
 *   networkId: 1234
 *   address: 0x5678
 * }
 * @returns string - Example: `1234:0x5678`
 */
export function tokenKey(id: TokenId): string {
  return `${id.networkId}:${id.address}`;
}

/**
 * Compares two TokenIds for equality by checking the address and networkId
 */
export function sameToken(
  a: TokenId | null | undefined,
  b: TokenId | null | undefined
): boolean {
  return (
    Boolean(a) &&
    Boolean(b) &&
    a!.address === b!.address &&
    a!.networkId === b!.networkId
  );
}

/**
 * Validates that the input is a valid NetworkId
 */
export function parseNetworkId(
  value: number | string | undefined | null
): NetworkId | null {
  if (value === null || value === '' || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  if (parsed === NETWORK_ID.ethereum || parsed === NETWORK_ID.solana) {
    return parsed;
  }
  return null;
}
