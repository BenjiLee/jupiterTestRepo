import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getTokenPrices } from '@/api/codex/getTokenPrices';
import { getTokens } from '@/api/codex/getTokens';
import { getHolding } from '@/api/getHoldings';
import { Polling } from '@/constants/polling';
import type { Address, NetworkId, TokenId } from '@/domain/types';
import { buildPortfolioRow } from '@/features/portfolio/portfolio';
import {
  readPortfolioRow,
  writePortfolioRow,
} from '@/features/portfolio/usePortfolio';

const strings = {
  missingNetwork: 'Token is missing a network',
};

/**
 * Checks the cache for a token and returns the token data. While
 * this hook is live, it will poll for the latest token data and
 * update the cache. If the token is not in the portfolio, it will
 * just return the token data.
 */
export function useToken(id: {
  address: Address;
  networkId: NetworkId | null;
}) {
  const queryClient = useQueryClient();
  const tokenId: TokenId | null =
    id.networkId == null
      ? null
      : { address: id.address, networkId: id.networkId };
  const cached = tokenId
    ? readPortfolioRow(queryClient, tokenId)
    : { row: undefined, dataUpdatedAt: undefined };

  return useQuery({
    queryKey: ['token', id.networkId, id.address],
    enabled: id.address.length > 0 && id.networkId != null,
    staleTime: Polling.tokenStaleMs,
    initialData: cached.row,
    initialDataUpdatedAt: cached.row ? cached.dataUpdatedAt : undefined,
    queryFn: async () => {
      if (tokenId == null) {
        throw new Error(strings.missingNetwork);
      }
      const [holding, prices, tokens] = await Promise.all([
        getHolding(tokenId),
        getTokenPrices([tokenId]),
        getTokens([tokenId]),
      ]);
      const row = buildPortfolioRow(holding, tokens, prices);
      if (holding.amount > 0) {
        writePortfolioRow(queryClient, row);
      }
      return row;
    },
  });
}
