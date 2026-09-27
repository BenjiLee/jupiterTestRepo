import type { Token } from '@/domain/types';
import type { PortfolioRow } from '@/features/portfolio/types';
import { ATOMIC_AMOUNT_PATTERN, uiAmountToAtomic } from '@/utils/amount';
import { tokenKey } from '@/utils/token';

export type SwapTokenOption = Token & {
  amount: number;
};

export function toSwapToken(token: Token, amount: number): SwapTokenOption {
  return { ...token, amount };
}

export function pickerTokens(
  rows: PortfolioRow[],
  topTokens: Token[]
): SwapTokenOption[] {
  const holdingKeys = new Set(rows.map((row) => tokenKey(row)));
  const topById = new Map(topTokens.map((token) => [tokenKey(token), token]));

  const owned = rows.flatMap((row) => {
    const token = row.token ?? topById.get(tokenKey(row));
    return token ? [toSwapToken(token, row.amount)] : [];
  });
  const rest = topTokens
    .filter((token) => !holdingKeys.has(tokenKey(token)))
    .map((token) => toSwapToken(token, 0));

  return [...owned, ...rest];
}

export function holdingCoversAmount(
  holding: number,
  decimals: number,
  inAmountAtomic: string
): boolean {
  if (!ATOMIC_AMOUNT_PATTERN.test(inAmountAtomic)) {
    return false;
  }
  const holdingAtomic = uiAmountToAtomic(String(holding), decimals) ?? '0';
  return BigInt(holdingAtomic) >= BigInt(inAmountAtomic);
}
