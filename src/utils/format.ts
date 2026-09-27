const compactUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const preciseUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 8,
});

const tokenAmountFormatters = new Map<number, Intl.NumberFormat>();

export function formatUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '-';
  }
  // Intl preserves the sign of -0, which renders as "-$0.00".
  const amount = Object.is(value, -0) ? 0 : value;
  const absolute = Math.abs(amount);
  if (absolute > 0 && absolute < 0.01) {
    return preciseUsd.format(amount);
  }
  return compactUsd.format(amount);
}

export function formatTokenAmount(value: number, decimals: number): string {
  const digits = Math.min(Math.max(Math.trunc(decimals), 0), 20);
  let formatter = tokenAmountFormatters.get(digits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: digits,
    });
    tokenAmountFormatters.set(digits, formatter);
  }
  return formatter.format(value);
}

export function formatImpact(value: number): string {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value)}%`;
}
