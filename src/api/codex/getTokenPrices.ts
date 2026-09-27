import { codexGraphql } from '@/api/codex/client';
import type { CodexPrice } from '@/api/codex/types';
import { mapCodexPrice } from '@/api/codex/utils';
import type { NetworkId, TokenPrice } from '@/domain/types';

const GET_TOKEN_PRICES = /* GraphQL */ `
  query GetTokenPrices($inputs: [GetPriceInput!]!) {
    getTokenPrices(inputs: $inputs) {
      address
      priceUsd
    }
  }
`;

type GetTokenPricesData = {
  getTokenPrices: (CodexPrice | null)[] | null;
};

export async function getTokenPrices(
  ids: { address: string; networkId: NetworkId }[]
): Promise<TokenPrice[]> {
  const data = await codexGraphql<GetTokenPricesData>(GET_TOKEN_PRICES, {
    inputs: ids.map((id) => ({ address: id.address, networkId: id.networkId })),
  });

  const remaining = (data.getTokenPrices ?? []).filter(
    (price): price is CodexPrice => price != null
  );

  return ids.flatMap((id) => {
    const index = remaining.findIndex((price) => price.address === id.address);
    if (index < 0) {
      return [];
    }
    const [price] = remaining.splice(index, 1);
    const mapped = mapCodexPrice(price ?? null, id);
    return mapped ? [mapped] : [];
  });
}
