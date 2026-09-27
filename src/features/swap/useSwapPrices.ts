import { useQuery } from '@tanstack/react-query';

import { getTokenPrices } from '@/api/codex/getTokenPrices';
import { Polling } from '@/constants/polling';
import type { TokenId } from '@/domain/types';
import { useIsScreenFocused } from '@/utils/hooks/useIsScreenFocused';
import { tokenKey } from '@/utils/token';

/**
 * Fetches the prices for a list of tokens.
 *
 * @param ids - A list of TokenIds
 * @returns A list of prices for the given tokens
 */
export function useSwapPrices(ids: TokenId[]) {
  const isFocused = useIsScreenFocused();
  const unique = [
    ...new Map(
      ids.filter((id) => id.address.length > 0).map((id) => [tokenKey(id), id])
    ).values(),
  ].sort((a, b) => tokenKey(a).localeCompare(tokenKey(b)));

  return useQuery({
    queryKey: ['swap-prices', unique.map(tokenKey)],
    enabled: unique.length > 0,
    subscribed: isFocused,
    staleTime: Polling.swapPricesStaleMs,
    queryFn: async () => {
      const prices = await getTokenPrices(unique);
      return Object.fromEntries(
        prices.map((price) => [tokenKey(price), price.priceUsd])
      );
    },
  });
}
