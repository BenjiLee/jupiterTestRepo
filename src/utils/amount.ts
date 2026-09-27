const AMOUNT_PATTERN = /^\d+(\.\d+)?$/;
export const ATOMIC_AMOUNT_PATTERN = /^\d+$/;

export function usdNotional({
  amountText,
  enabled,
  priceUsd,
}: {
  amountText: string | undefined;
  enabled: boolean;
  priceUsd?: number;
}): number | null {
  if (!enabled || priceUsd == null || amountText == null) {
    return null;
  }
  const amount = Number(amountText.replace(/,/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return amount * priceUsd;
}

export function sanitizeAmountInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot === -1) {
    return cleaned;
  }
  return `${cleaned.slice(0, dot + 1)}${cleaned.slice(dot + 1).replace(/\./g, '')}`;
}

export function uiAmountToAtomic(
  amount: string,
  decimals: number
): string | null {
  if (!Number.isInteger(decimals) || decimals < 0) {
    return null;
  }

  const trimmed = amount.trim();
  const normalized = trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
  if (!AMOUNT_PATTERN.test(normalized)) {
    return null;
  }

  const [whole, fraction = ''] = normalized.split('.');
  if (whole === undefined || fraction.length > decimals) {
    return null;
  }

  const atomic = `${whole}${fraction.padEnd(decimals, '0')}`.replace(/^0+/, '');
  return atomic.length === 0 ? null : atomic;
}

/**
 * Converts an atomic amount to a plain UI string for an amount field.
 * No grouping separators, so the result can be edited as typed text.
 *
 * Ex:
 * atomicToUiString('1000000000', 9) => '1'
 */
export function atomicToUiString(
  atomic: string,
  decimals: number
): string | null {
  if (
    !ATOMIC_AMOUNT_PATTERN.test(atomic) ||
    !Number.isInteger(decimals) ||
    decimals < 0
  ) {
    return null;
  }

  const padded = atomic.replace(/^0+/, '').padStart(decimals, '0');
  const whole = padded.slice(0, padded.length - decimals) || '0';
  const fraction = padded.slice(padded.length - decimals).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
}

export function atomicToUiAmount(
  atomic: string,
  decimals: number
): number | null {
  if (
    !ATOMIC_AMOUNT_PATTERN.test(atomic) ||
    !Number.isInteger(decimals) ||
    decimals < 0
  ) {
    return null;
  }

  if (decimals === 0) {
    const whole = Number(atomic);
    return Number.isFinite(whole) ? whole : null;
  }

  const padded = atomic.padStart(decimals + 1, '0');
  const splitAt = padded.length - decimals;
  const value = Number(`${padded.slice(0, splitAt)}.${padded.slice(splitAt)}`);
  return Number.isFinite(value) ? value : null;
}
