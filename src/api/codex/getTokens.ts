import { codexGraphql } from '@/api/codex/client';
import type { CodexToken } from '@/api/codex/types';
import { mapCodexToken } from '@/api/codex/utils';
import type { Token, TokenId } from '@/domain/types';

const GET_TOKENS = /* GraphQL */ `
  query GetTokens($ids: [TokenInput!]) {
    tokens(ids: $ids) {
      address
      name
      symbol
      decimals
      info {
        imageThumbUrl
      }
    }
  }
`;

type GetTokensData = {
  tokens: (CodexToken | null)[] | null;
};

export async function getTokens(ids: TokenId[]): Promise<Token[]> {
  const data = await codexGraphql<GetTokensData>(GET_TOKENS, {
    ids,
  });

  return (data.tokens ?? []).flatMap((token) => {
    if (token == null) {
      return [];
    }
    const id = ids.find((item) => item.address === token.address);
    const mapped = id ? mapCodexToken(token, id.networkId) : null;
    return mapped ? [mapped] : [];
  });
}
