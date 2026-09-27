import { codexGraphql } from '@/api/codex/client';
import type { CodexTokenBars } from '@/api/codex/types';
import type { Address, NetworkId } from '@/domain/types';
import { DAY_SECONDS } from '@/utils/time';

const GET_TOKEN_BARS = /* GraphQL */ `
  query GetTokenBars(
    $symbol: String!
    $from: Int!
    $to: Int!
    $resolution: String!
  ) {
    getTokenBars(
      symbol: $symbol
      from: $from
      to: $to
      resolution: $resolution
      currencyCode: USD
      removeEmptyBars: false
    ) {
      t
      c
    }
  }
`;

type GetTokenBarsData = {
  getTokenBars: CodexTokenBars | null;
};

/** Chart time window configs */
export const CHART_WINDOW_CONFIG: Record<
  string,
  {
    /** Number of seconds in the chart window */
    windowSeconds: number;
    /** Length of ticks of the chart in minutes */
    resolutionMinutes: number;
  }
> = {
  ONE_DAY: {
    windowSeconds: DAY_SECONDS,
    resolutionMinutes: 15,
  },
  ONE_WEEK: {
    windowSeconds: 7 * DAY_SECONDS,
    resolutionMinutes: 60,
  },
} as const;

export type TokenBarsWindowConfig =
  (typeof CHART_WINDOW_CONFIG)[keyof typeof CHART_WINDOW_CONFIG];

/**
 * Fetches the token bar data for the given address and window.
 */
export async function getTokenBars(
  address: Address,
  networkId: NetworkId,
  window: TokenBarsWindowConfig,
  nowSeconds = Math.floor(Date.now() / 1000)
): Promise<CodexTokenBars> {
  const { windowSeconds, resolutionMinutes: resolution } = window;

  const data = await codexGraphql<GetTokenBarsData>(GET_TOKEN_BARS, {
    symbol: `${address}:${networkId}`,
    from: nowSeconds - windowSeconds,
    to: nowSeconds,
    resolution: resolution.toFixed(0),
  });

  return {
    t: data.getTokenBars?.t ?? [],
    c: data.getTokenBars?.c ?? [],
  };
}
