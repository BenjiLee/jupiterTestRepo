import { formatImpact, formatTokenAmount, formatUsd } from '@/utils/format';

test.each`
  value         | expected
  ${null}       | ${'-'}
  ${undefined}  | ${'-'}
  ${Number.NaN} | ${'-'}
  ${Infinity}   | ${'-'}
  ${-Infinity}  | ${'-'}
`(
  'returns a dash when the amount cannot be formatted ($value)',
  ({ value, expected }) => {
    expect(formatUsd(value)).toBe(expected);
  }
);

test.each`
  value      | expected
  ${0}       | ${'$0.00'}
  ${-0}      | ${'$0.00'}
  ${123}     | ${'$123.00'}
  ${12.34}   | ${'$12.34'}
  ${999.99}  | ${'$999.99'}
  ${1000}    | ${'$1,000.00'}
  ${1000000} | ${'$1,000,000.00'}
  ${-42}     | ${'-$42.00'}
`('formats normal and large USD amounts ($value)', ({ value, expected }) => {
  expect(formatUsd(value)).toBe(expected);
});

test.each`
  value          | expected
  ${0.009}       | ${'$0.009'}
  ${-0.00123456} | ${'-$0.00123456'}
  ${0.00000012}  | ${'$0.00000012'}
  ${-0.00987654} | ${'-$0.00987654'}
`('formats precise small USD amounts ($value)', ({ value, expected }) => {
  expect(formatUsd(value)).toBe(expected);
});

test('formats a token amount using that token’s decimals', () => {
  expect(formatTokenAmount(1.123456789, 9)).toBe('1.123456789');
  expect(formatTokenAmount(1.129, 2)).toBe('1.13');
  expect(formatTokenAmount(10.5, 0)).toBe('11');
});

test('formats price impact with up to 4 fraction digits', () => {
  expect(formatImpact(1.234567)).toBe('1.2346%');
  expect(formatImpact(0)).toBe('0%');
});
