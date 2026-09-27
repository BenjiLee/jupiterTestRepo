import { codexGraphql } from '@/api/codex/client';
import type { CodexToken } from '@/api/codex/types';
import { mapCodexToken } from '@/api/codex/utils';
import type { NetworkId, Token } from '@/domain/types';
import { parseNetworkId } from '@/utils/token';

/** Strictly above this 24h volume, in USD. */
const MIN_VOLUME_24_USD = 1_000_000;
/** A pool this thin with high volume is usually wash trading. */
const MIN_LIQUIDITY_USD = 100_000;
const MIN_HOLDERS = 100;
const MIN_UNIQUE_TRANSACTIONS_24 = 100;

const GET_TOP_TOKENS = /* GraphQL */ `
  query GetTopTokensByVolume(
    $filters: TokenFilters
    $attribute: TokenRankingAttribute!
    $limit: Int!
  ) {
    filterTokens(
      filters: $filters
      rankings: { attribute: $attribute, direction: DESC }
      statsType: FILTERED
      limit: $limit
    ) {
      results {
        token {
          address
          networkId
          name
          symbol
          decimals
          info {
            imageThumbUrl
          }
        }
      }
    }
  }
`;

type GetTopTokensData = {
  filterTokens: {
    results: { token: CodexToken | null }[] | null;
  } | null;
};

export const TOP_TOKENS_BY_VOLUME_LIMIT = 20;

export async function getTopTokensByVolume(
  networkIds: NetworkId[],
  attribute: 'volume24',
  limit = TOP_TOKENS_BY_VOLUME_LIMIT
): Promise<Token[]> {
  if (networkIds.length === 0) {
    return [];
  }

  const data = await codexGraphql<GetTopTokensData>(GET_TOP_TOKENS, {
    filters: {
      network: networkIds,
      volume24: { gt: MIN_VOLUME_24_USD },
      liquidity: { gte: MIN_LIQUIDITY_USD },
      holders: { gte: MIN_HOLDERS },
      uniqueTransactions24: { gte: MIN_UNIQUE_TRANSACTIONS_24 },
      potentialScam: false,
      trendingIgnored: false,
      profanity: false,
      includeScams: false,
      isTestnet: false,
      // Freeze or mint authority is a common Solana rug.
      freezable: false,
      mintable: false,
    },
    attribute,
    limit,
  });

  return (data.filterTokens?.results ?? []).flatMap((result) => {
    const networkId = parseNetworkId(result.token?.networkId);
    if (networkId == null) {
      return [];
    }
    const token = mapCodexToken(result.token, networkId);
    return token ? [token] : [];
  });
}
