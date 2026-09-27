import { useQuery } from '@tanstack/react-query';

import {
  getTokenBars,
  type TokenBarsWindowConfig,
} from '@/api/codex/getTokenBars';
import { barsToChartPoints } from '@/components/TokenChart/chartUtils';
import { Polling } from '@/constants/polling';
import type { Address, NetworkId } from '@/domain/types';

/**
 * For the given token, network, and window configuration,
 * fetches the token bar data and converts it to chart points.
 */
export function useTokenChart(
  address: Address,
  networkId: NetworkId,
  window: TokenBarsWindowConfig
) {
  return useQuery({
    queryKey: [
      'token-chart',
      networkId,
      address,
      window.windowSeconds,
      window.resolutionMinutes,
    ],
    queryFn: async () =>
      barsToChartPoints(await getTokenBars(address, networkId, window)),
    staleTime: Polling.tokenChartStaleMs,
  });
}
