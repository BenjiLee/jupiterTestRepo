import type { CodexPrice, CodexToken } from '@/api/codex/types';
import type { NetworkId, Token, TokenId, TokenPrice } from '@/domain/types';

export function mapCodexToken(
  token: CodexToken | null,
  networkId: NetworkId
): Token | null {
  if (
    token == null ||
    !token.symbol ||
    !Number.isInteger(token.decimals) ||
    token.decimals < 0
  ) {
    return null;
  }

  return {
    address: token.address,
    networkId,
    symbol: token.symbol,
    name: token.name ?? token.symbol,
    decimals: token.decimals,
    logoUrl: token.info?.imageThumbUrl ?? undefined,
  };
}

export function mapCodexPrice(
  price: CodexPrice | null,
  id: TokenId
): TokenPrice | null {
  if (price == null || !Number.isFinite(price.priceUsd)) {
    return null;
  }

  return {
    address: id.address,
    networkId: id.networkId,
    priceUsd: price.priceUsd,
  };
}
