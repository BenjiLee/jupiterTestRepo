/**
 * Files for Jupiter API calls.
 *
 * I considered using the Jupiter package to get types for functions and
 * responses for the client but in a more mature production app, we might
 * not need this if we are planning on hitting an API gateway with our own
 * types.
 */

import { ApiError, restGet } from '@/api/client';
import type { Address } from '@/domain/types';
import { ATOMIC_AMOUNT_PATTERN } from '@/utils/amount';

const strings = {
  missingApiKey: 'Missing EXPO_PUBLIC_JUPITER_API_KEY',
  missingInputAmount: 'Jupiter quote did not include an input amount',
  missingOutputAmount: 'Jupiter quote did not include an output amount',
};

const QUOTE_URL = 'https://api.jup.ag/swap/v1/quote';
const SLIPPAGE_BPS = '50';

export type SwapMode = 'ExactIn' | 'ExactOut';

export type JupiterQuote = {
  inAmount: string;
  outAmount: string;
  priceImpactPct: number | null;
  swapMode: SwapMode;
};

type QuoteResponse = {
  inAmount?: string;
  outAmount?: string;
  priceImpactPct?: string | number | null;
  swapMode?: SwapMode;
};

type QuoteRequest = {
  inputAddress: Address;
  outputAddress: Address;
  amountAtomic: string;
  swapMode: SwapMode;
};

export async function getQuote(request: QuoteRequest): Promise<JupiterQuote> {
  const apiKey = process.env.EXPO_PUBLIC_JUPITER_API_KEY?.trim();
  if (!apiKey) {
    throw new ApiError('http', strings.missingApiKey);
  }

  const params = new URLSearchParams({
    inputMint: request.inputAddress,
    outputMint: request.outputAddress,
    amount: request.amountAtomic,
    slippageBps: SLIPPAGE_BPS,
    swapMode: request.swapMode,
  });
  const raw = await restGet<QuoteResponse>(
    `${QUOTE_URL}?${params.toString()}`,
    {
      'x-api-key': apiKey,
    }
  );

  if (!raw.inAmount || !ATOMIC_AMOUNT_PATTERN.test(raw.inAmount)) {
    throw new ApiError('http', strings.missingInputAmount);
  }
  if (!raw.outAmount || !ATOMIC_AMOUNT_PATTERN.test(raw.outAmount)) {
    throw new ApiError('http', strings.missingOutputAmount);
  }

  return {
    inAmount: raw.inAmount,
    outAmount: raw.outAmount,
    priceImpactPct: parsePriceImpact(raw.priceImpactPct),
    swapMode: raw.swapMode === 'ExactOut' ? 'ExactOut' : 'ExactIn',
  };
}

function parsePriceImpact(
  value: QuoteResponse['priceImpactPct']
): number | null {
  // Jupiter returns a 0–1 fraction; store as percent for display.
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value * 100;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed * 100 : null;
  }
  return null;
}
