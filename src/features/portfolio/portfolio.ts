import type { Holding, Token, TokenPrice } from '@/domain/types';
import type { Portfolio, PortfolioRow } from '@/features/portfolio/types';
import { sameToken } from '@/utils/token';

export function buildPortfolioRow(
  holding: Holding,
  tokens: Token[],
  prices: TokenPrice[]
): PortfolioRow {
  const token = tokens.find((item) => sameToken(item, holding)) ?? null;
  const priceUsd = prices.find((price) => sameToken(price, holding))?.priceUsd;

  if (priceUsd === undefined || !Number.isFinite(priceUsd)) {
    return {
      address: holding.address,
      networkId: holding.networkId,
      token,
      amount: holding.amount,
      priceUsd: null,
      valueUsd: null,
    };
  }

  return {
    address: holding.address,
    networkId: holding.networkId,
    token,
    amount: holding.amount,
    priceUsd: priceUsd,
    valueUsd: holding.amount * priceUsd,
  };
}

export function buildPortfolio(
  holdings: Holding[],
  tokens: Token[],
  prices: TokenPrice[]
): Portfolio {
  const rows = holdings
    .map((holding) => buildPortfolioRow(holding, tokens, prices))
    .sort(compareByValueUsd);
  const totalUsd = rows.reduce((sum, row) => sum + (row.valueUsd ?? 0), 0);

  return { rows, totalUsd };
}

export function mergePortfolioRow(
  current: Portfolio | undefined,
  row: PortfolioRow
): Portfolio {
  const rows = current?.rows.some((item) => sameToken(item, row))
    ? current.rows.map((item) => (sameToken(item, row) ? row : item))
    : [...(current?.rows ?? []), row];

  return {
    rows: rows.sort(compareByValueUsd),
    totalUsd: rows.reduce((sum, item) => sum + (item.valueUsd ?? 0), 0),
  };
}

function compareByValueUsd(a: PortfolioRow, b: PortfolioRow): number {
  if (a.valueUsd == null && b.valueUsd == null) {
    return 0;
  }
  if (a.valueUsd == null) {
    return 1;
  }
  if (b.valueUsd == null) {
    return -1;
  }
  return b.valueUsd - a.valueUsd;
}
