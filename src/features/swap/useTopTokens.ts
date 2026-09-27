import { useQuery } from '@tanstack/react-query';

import { getTopTokensByVolume } from '@/api/codex/getTopTokens';
import { Polling } from '@/constants/polling';
import type { NetworkId } from '@/domain/types';

export const TOP_TOKENS_QUERY_KEY = [
  'top-tokens',
  'volume24',
  'screened',
] as const;

export function useTopTokens(
  networkIds: NetworkId[],
  { enabled = true }: { enabled?: boolean } = {}
) {
  const ids = [...new Set(networkIds)].sort((a, b) => a - b);

  return useQuery({
    queryKey: [...TOP_TOKENS_QUERY_KEY, ids],
    queryFn: () => getTopTokensByVolume(ids, 'volume24'),
    staleTime: Polling.topTokensStaleMs,
    enabled: enabled && ids.length > 0,
  });
}
