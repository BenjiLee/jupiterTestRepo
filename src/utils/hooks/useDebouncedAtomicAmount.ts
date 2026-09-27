import { uiAmountToAtomic } from '@/utils/amount';
import { useDebouncedValue } from '@/utils/hooks/useDebouncedValue';

/**
 * Hook that debounces a user-entered token amount string and converts both the
 * live and debounced values into atomic amount format (integer representation based on decimals).
 *
 * @param amountText - The current token amount as a string input by the user.
 * @param decimals - The number of decimal places for atomic conversion (e.g., 6 for USDC).
 * @param delayMs - The debounce delay in milliseconds.
 *
 * @returns An object containing:
 *   - debouncedAmount: The debounced version of amountText.
 *   - liveAtomic: The atomic value of the live amountText input (or null if decimals undefined).
 *   - debouncedAtomic: The atomic value of the debounced input (or null if decimals undefined).
 *   - isDebouncing: Boolean flag indicating if the value is currently debouncing.
 */
export function useDebouncedAtomicAmount(
  amountText: string,
  decimals: number | undefined,
  delayMs: number
) {
  const debouncedAmount = useDebouncedValue(amountText, delayMs);
  const liveAtomic =
    decimals == null ? null : uiAmountToAtomic(amountText, decimals);
  const debouncedAtomic =
    decimals == null ? null : uiAmountToAtomic(debouncedAmount, decimals);
  const isDebouncing = amountText !== debouncedAmount;

  return { debouncedAmount, liveAtomic, debouncedAtomic, isDebouncing };
}
