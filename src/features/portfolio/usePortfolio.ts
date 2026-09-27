import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { getTokenPrices } from '@/api/codex/getTokenPrices';
import { getTokens } from '@/api/codex/getTokens';
import { getHoldings } from '@/api/getHoldings';
import { Polling } from '@/constants/polling';
import type { Holding, TokenId } from '@/domain/types';
import {
  buildPortfolio,
  mergePortfolioRow,
} from '@/features/portfolio/portfolio';
import type { Portfolio, PortfolioRow } from '@/features/portfolio/types';
import { useIsScreenFocused } from '@/utils/hooks/useIsScreenFocused';
import { sameToken } from '@/utils/token';

export const PORTFOLIO_QUERY_KEY = ['portfolio'] as const;
export const HOLDINGS_QUERY_KEY = ['holdings'] as const;

export function readPortfolioRow(queryClient: QueryClient, id: TokenId) {
  const state = queryClient.getQueryState<Portfolio>(PORTFOLIO_QUERY_KEY);
  return {
    row: state?.data?.rows.find((item) => sameToken(item, id)),
    dataUpdatedAt: state?.dataUpdatedAt,
  };
}

export function writePortfolioRow(queryClient: QueryClient, row: PortfolioRow) {
  queryClient.setQueryData<Portfolio>(PORTFOLIO_QUERY_KEY, (current) =>
    mergePortfolioRow(current, row)
  );
}

/**
 * Returns the user's portfolio. In a production app this would likely
 * be a BE query that returnsa portfolio object instead of the client
 * constructing it from multiple sources. Since a user can have multiple
 * wallets we can either pass in all of those addresses or the BE can
 * do a user lookup from the request metadata.
 */
async function getPortfolio(holdings: Holding[]): Promise<Portfolio> {
  const ids = holdings.map(({ address, networkId }) => ({
    address,
    networkId,
  }));
  const [prices, tokens] = await Promise.all([
    getTokenPrices(ids),
    getTokens(ids),
  ]);

  return buildPortfolio(holdings, tokens, prices);
}

export function useHoldings() {
  const isFocused = useIsScreenFocused();

  return useQuery({
    queryKey: HOLDINGS_QUERY_KEY,
    queryFn: getHoldings,
    staleTime: Polling.holdingsStaleMs,
    subscribed: isFocused,
  });
}

export function usePortfolio({ live = false }: { live?: boolean } = {}) {
  const isFocused = useIsScreenFocused();
  const queryClient = useQueryClient();
  const holdingsQuery = useHoldings();

  const portfolioQuery = useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    enabled: holdingsQuery.isSuccess,
    queryFn: () =>
      getPortfolio(queryClient.getQueryData(HOLDINGS_QUERY_KEY) ?? []),
    subscribed: isFocused,
    staleTime: Polling.portfolioStaleMs,
    refetchInterval: live && isFocused ? Polling.portfolioMs : false,
  });

  const hasCachedPortfolio = portfolioQuery.data != null;

  return {
    ...portfolioQuery,
    isPending:
      !hasCachedPortfolio &&
      (holdingsQuery.isPending || portfolioQuery.isPending),
    isFetching: holdingsQuery.isFetching || portfolioQuery.isFetching,
    isError: holdingsQuery.isError || portfolioQuery.isError,
    error: holdingsQuery.error ?? portfolioQuery.error,
    refetch: async () => {
      await holdingsQuery.refetch();
      return portfolioQuery.refetch();
    },
  };
}

export function usePortfolioRow(id: TokenId) {
  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: (): Promise<Portfolio> =>
      Promise.reject(new Error('Portfolio rows are read from cache')),
    enabled: false,
    select: (portfolio) => portfolio.rows.find((row) => sameToken(row, id)),
  });
}
