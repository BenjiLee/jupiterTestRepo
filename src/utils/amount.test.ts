import {
  atomicToUiAmount,
  atomicToUiString,
  uiAmountToAtomic,
  usdNotional,
} from '@/utils/amount';

describe('uiAmountToAtomic', () => {
  test.each`
    amount        | decimals | expected
    ${'1'}        | ${9}     | ${'1000000000'}
    ${'0.5'}      | ${9}     | ${'500000000'}
    ${'0'}        | ${9}     | ${null}
    ${'1.5'}      | ${5}     | ${'150000'}
    ${'1.123456'} | ${5}     | ${null}
  `(
    'converts $amount with $decimals decimals to $expected',
    ({ amount, decimals, expected }) => {
      expect(uiAmountToAtomic(amount, decimals)).toBe(expected);
    }
  );
});

describe('atomicToUiAmount', () => {
  test.each`
    atomic          | decimals | expected
    ${'1000000000'} | ${9}     | ${1}
    ${'150000'}     | ${5}     | ${1.5}
  `(
    'converts atomic $atomic with $decimals decimals to ui amount $expected',
    ({ atomic, decimals, expected }) => {
      expect(atomicToUiAmount(atomic, decimals)).toBe(expected);
    }
  );
});

describe('usdNotional', () => {
  test.each`
    amountText   | enabled  | priceUsd | expected
    ${'2'}       | ${true}  | ${150}   | ${300}
    ${'1,000'}   | ${true}  | ${2}     | ${2000}
    ${'2'}       | ${false} | ${150}   | ${null}
    ${'0'}       | ${true}  | ${150}   | ${null}
    ${undefined} | ${true}  | ${150}   | ${null}
  `(
    'usdNotional({ amountText: $amountText, enabled: $enabled, priceUsd: $priceUsd }) = $expected',
    ({ amountText, enabled, priceUsd, expected }) => {
      expect(usdNotional({ amountText, enabled, priceUsd })).toBe(expected);
    }
  );
});

describe('atomicToUiString', () => {
  test.each`
    atomic             | decimals | expected
    ${'1000000000000'} | ${9}     | ${'1000'}
    ${'1000000000'}    | ${9}     | ${'1'}
    ${'150000'}        | ${5}     | ${'1.5'}
    ${'1'}             | ${6}     | ${'0.000001'}
    ${'10'}            | ${0}     | ${'10'}
    ${'0'}             | ${6}     | ${'0'}
  `(
    'formats atomic $atomic with $decimals decimals as $expected',
    ({ atomic, decimals, expected }) => {
      expect(atomicToUiString(atomic, decimals)).toBe(expected);
    }
  );
});
