import type { Token, TokenId } from '@/domain/types';

export type PortfolioRow = TokenId & {
  token: Token | null;
  amount: number;
  priceUsd: number | null;
  valueUsd: number | null;
};

export type Portfolio = {
  rows: PortfolioRow[];
  totalUsd: number;
};
