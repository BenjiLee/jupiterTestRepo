import { useEffect, useMemo } from 'react';

import { NETWORK_ID, type TokenId } from '@/domain/types';
import { usePortfolio } from '@/features/portfolio/usePortfolio';
import { pickerTokens, type SwapTokenOption } from '@/features/swap/utils';
import { useTopTokens } from '@/features/swap/useTopTokens';
import { useSwapUi } from '@/features/swap/swapUi';
import { sameToken } from '@/utils/token';

function findToken(
  tokens: SwapTokenOption[],
  id: TokenId | null
): SwapTokenOption | null {
  if (id == null) {
    return null;
  }
  return tokens.find((item) => sameToken(item, id)) ?? null;
}

/**
 * Holdings and top tokens for the swap form. Token ids live in the store;
 * the full token, including balance, comes from this list.
 *
 * When both sides are empty and the portfolio has loaded, the input id is
 * set to the first holding, or the first top token when nothing is held.
 */
export function useSwapTokens(open = false) {
  const { inputTokenId, outputTokenId, setInputTokenId, setOutputTokenId } =
    useSwapUi();
  const { data: portfolio, isSuccess: portfolioReady } = usePortfolio();
  const held = useMemo(
    () => pickerTokens(portfolio?.rows ?? [], []),
    [portfolio]
  );
  const networkId = inputTokenId?.networkId ?? NETWORK_ID.solana;
  const inputIsHeld =
    inputTokenId != null && held.some((item) => sameToken(item, inputTokenId));
  const outputIsHeld =
    outputTokenId != null &&
    held.some((item) => sameToken(item, outputTokenId));
  const needsTopTokens =
    (inputTokenId == null && held.length === 0) ||
    (inputTokenId != null && !inputIsHeld) ||
    (outputTokenId != null && !outputIsHeld);
  const { data: topTokens } = useTopTokens([networkId], {
    enabled: portfolioReady && (open || needsTopTokens),
  });
  const tokens = useMemo(
    () => pickerTokens(portfolio?.rows ?? [], topTokens ?? []),
    [portfolio, topTokens]
  );

  useEffect(() => {
    if (inputTokenId != null || outputTokenId != null || !portfolioReady) {
      return;
    }
    const first = held[0] ?? tokens[0];
    if (!first) {
      return;
    }
    setInputTokenId(first);
  }, [
    held,
    inputTokenId,
    outputTokenId,
    portfolioReady,
    setInputTokenId,
    tokens,
  ]);

  return {
    tokens,
    inputToken: findToken(tokens, inputTokenId),
    outputToken: findToken(tokens, outputTokenId),
    inputTokenId,
    outputTokenId,
    setInputTokenId,
    setOutputTokenId,
  };
}
