import { create } from 'zustand';

import type { TokenId } from '@/domain/types';
import { sanitizeAmountInput } from '@/utils/amount';
import { sameToken } from '@/utils/token';

/** The side of the leg (input or output). */
export type SwapAmountSide = 'input' | 'output';

const DEFAULT_SWAP_UI = {
  inputTokenId: null as TokenId | null,
  outputTokenId: null as TokenId | null,
  lastEdited: 'input' as SwapAmountSide,
  inputAmountText: '',
  outputAmountText: '',
};

type SwapUiState = {
  inputTokenId: TokenId | null;
  outputTokenId: TokenId | null;
  lastEdited: SwapAmountSide;
  inputAmountText: string;
  outputAmountText: string;
  setInputTokenId: (token: TokenId) => void;
  setOutputTokenId: (token: TokenId) => void;
  setInputAmountText: (amountText: string) => void;
  setOutputAmountText: (amountText: string) => void;
  prefillInput: (token: TokenId) => void;
  flip: () => void;
  reset: () => void;
};

function toTokenId(token: TokenId): TokenId {
  return { address: token.address, networkId: token.networkId };
}

export const useSwapUi = create<SwapUiState>((set) => ({
  ...DEFAULT_SWAP_UI,
  setInputTokenId: (token) =>
    set((state) => {
      if (
        state.outputTokenId != null &&
        sameToken(token, state.outputTokenId)
      ) {
        return state;
      }
      return { inputTokenId: toTokenId(token) };
    }),
  setOutputTokenId: (token) =>
    set((state) => {
      if (state.inputTokenId != null && sameToken(token, state.inputTokenId)) {
        return state;
      }
      return { outputTokenId: toTokenId(token) };
    }),
  setInputAmountText: (amountText) =>
    set({
      lastEdited: 'input',
      inputAmountText: sanitizeAmountInput(amountText),
    }),
  setOutputAmountText: (amountText) =>
    set({
      lastEdited: 'output',
      outputAmountText: sanitizeAmountInput(amountText),
    }),
  prefillInput: (token) =>
    set({
      inputTokenId: toTokenId(token),
      outputTokenId: null,
      lastEdited: 'input',
      inputAmountText: '',
      outputAmountText: '',
    }),
  flip: () =>
    set((state) => {
      if (state.outputTokenId == null) {
        return state;
      }
      return {
        inputTokenId: state.outputTokenId,
        outputTokenId: state.inputTokenId,
      };
    }),
  reset: () => set(DEFAULT_SWAP_UI),
}));
