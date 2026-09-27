import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { ApiError } from '@/api/client';
import { getQuote, type SwapMode } from '@/api/jupiter/getQuote';
import { Polling } from '@/constants/polling';
import type { SwapTokenOption } from '@/features/swap/utils';
import { atomicToUiString } from '@/utils/amount';
import { useDebouncedAtomicAmount } from '@/utils/hooks/useDebouncedAtomicAmount';
import { useIsScreenFocused } from '@/utils/hooks/useIsScreenFocused';
import { sameToken } from '@/utils/token';

const strings = {
  quoteNotReady: 'Quote is not ready',
  unusableAmount: 'Jupiter returned an unusable amount',
};

const QUOTE_DEBOUNCE_MS = 400;
export type SwapExactSide = 'input' | 'output';

export type SwapQuoteView = {
  swapMode: SwapMode;
  inAmountAtomic: string;
  outAmountAtomic: string;
  inAmountText: string;
  outAmountText: string;
  /** The price impact of the swap between 0-100 */
  priceImpactPct: number | null;
};

export type SwapQuoteResult = UseQueryResult<SwapQuoteView> & {
  /** Parsed amount in atomic units. Null when the text is not a valid amount. */
  liveAtomic: string | null;
  /** Quoted amount for the side the user is not editing. */
  quotedAmountText: string;
  /** True while the typed amount is settling or the quote request is in flight. */
  isQuotePending: boolean;
  /** True when a quote is ready for the current amount. */
  hasQuote: boolean;
};

type SwapQuoteInput = {
  /** The token to swap from. */
  inputToken: SwapTokenOption | null | undefined;
  /** The token to swap to. */
  outputToken: SwapTokenOption | null | undefined;
  /** The amount to swap. */
  amountText: string;
  /** The side of the swap to exact. */
  exactSide: SwapExactSide;
};

/**
 * Fetches the quote price for the given input and output tokens and amount.
 * The exact in/out is based on the exactSide.
 */
export function useSwapQuote({
  inputToken,
  outputToken,
  amountText,
  exactSide,
}: SwapQuoteInput): SwapQuoteResult {
  const isFocused = useIsScreenFocused();
  const addressesDiffer = !sameToken(inputToken, outputToken);
  const { swapMode, amountToken } =
    exactSide === 'input'
      ? { swapMode: 'ExactIn' as const, amountToken: inputToken }
      : { swapMode: 'ExactOut' as const, amountToken: outputToken };

  const { liveAtomic, debouncedAtomic, isDebouncing } =
    useDebouncedAtomicAmount(
      amountText,
      amountToken?.decimals,
      QUOTE_DEBOUNCE_MS
    );
  const isQuoteDebouncing = isDebouncing && addressesDiffer;

  const query = useQuery({
    queryKey: [
      'swap-quote',
      swapMode,
      inputToken?.networkId,
      inputToken?.address,
      outputToken?.networkId,
      outputToken?.address,
      debouncedAtomic,
    ],
    enabled: Boolean(
      debouncedAtomic && addressesDiffer && inputToken && outputToken
    ),
    subscribed: isFocused,
    refetchInterval: isFocused ? Polling.swapQuoteMs : false,
    queryFn: async (): Promise<SwapQuoteView> => {
      if (!debouncedAtomic || !inputToken || !outputToken) {
        throw new ApiError('http', strings.quoteNotReady);
      }

      const quote = await getQuote({
        inputAddress: inputToken.address,
        outputAddress: outputToken.address,
        amountAtomic: debouncedAtomic,
        swapMode,
      });
      const inAmountText = atomicToUiString(
        quote.inAmount,
        inputToken.decimals
      );
      const outAmountText = atomicToUiString(
        quote.outAmount,
        outputToken.decimals
      );
      if (inAmountText == null || outAmountText == null) {
        throw new ApiError('http', strings.unusableAmount);
      }

      return {
        swapMode: quote.swapMode,
        inAmountAtomic: quote.inAmount,
        outAmountAtomic: quote.outAmount,
        inAmountText,
        outAmountText,
        priceImpactPct: quote.priceImpactPct,
      };
    },
  });

  const hasQuote = Boolean(
    liveAtomic && query.data && !query.isError && !isQuoteDebouncing
  );
  const quotedAmountText =
    hasQuote && query.data
      ? exactSide === 'input'
        ? query.data.outAmountText
        : query.data.inAmountText
      : '';

  return {
    ...query,
    liveAtomic,
    quotedAmountText,
    isQuotePending: isQuoteDebouncing || (query.isFetching && !query.data),
    hasQuote,
  };
}
