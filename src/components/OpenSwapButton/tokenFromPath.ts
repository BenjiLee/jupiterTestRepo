import type { TokenId } from '@/domain/types';
import { parseNetworkId } from '@/utils/token';

/**
 * Gets the token details from the path
 *
 * @param pathname Ex: /token/1399811149/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
 * @returns TokenId Ex: { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', networkId: 1399811149 }
 */
export function tokenFromPath(pathname: string): TokenId | null {
  const match = pathname.match(/^\/token\/([^/]+)\/([^/]+)/);
  if (!match) {
    return null;
  }
  const networkId = parseNetworkId(decodeURIComponent(match[1]));
  const address = decodeURIComponent(match[2]);
  if (networkId == null || address === '') {
    return null;
  }
  return { address, networkId };
}
