import { NETWORK_ID, type Holding, type Token } from '@/domain/types';
import {
  buildPortfolio,
  mergePortfolioRow,
} from '@/features/portfolio/portfolio';

const sol: Token = {
  address: 'sol-address',
  networkId: NETWORK_ID.solana,
  symbol: 'SOL',
  name: 'Solana',
  decimals: 9,
};
const usdc: Token = {
  address: 'usdc-address',
  networkId: NETWORK_ID.solana,
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
};

const holdings: Holding[] = [
  { address: sol.address, networkId: NETWORK_ID.solana, amount: 2 },
  { address: usdc.address, networkId: NETWORK_ID.solana, amount: 10 },
];

describe('buildPortfolio', () => {
  test('values each holding and sums the tokens that have a price', () => {
    const portfolio = buildPortfolio(
      holdings,
      [sol, usdc],
      [
        { address: sol.address, networkId: NETWORK_ID.solana, priceUsd: 150 },
        { address: usdc.address, networkId: NETWORK_ID.solana, priceUsd: 1 },
      ]
    );

    expect(portfolio.rows[0]).toMatchObject({
      token: sol,
      priceUsd: 150,
      valueUsd: 300,
    });
    expect(portfolio.rows[1]).toMatchObject({
      token: usdc,
      priceUsd: 1,
      valueUsd: 10,
    });
    expect(portfolio.totalUsd).toBe(310);
  });

  test('sorts rows by USD value, highest first', () => {
    const portfolio = buildPortfolio(
      holdings,
      [sol, usdc],
      [
        { address: sol.address, networkId: NETWORK_ID.solana, priceUsd: 1 },
        { address: usdc.address, networkId: NETWORK_ID.solana, priceUsd: 1 },
      ]
    );

    expect(portfolio.rows.map((row) => row.address)).toEqual([
      usdc.address,
      sol.address,
    ]);
  });

  test('leaves a row without a USD value when its price is missing', () => {
    const portfolio = buildPortfolio(
      holdings,
      [sol],
      [{ address: sol.address, networkId: NETWORK_ID.solana, priceUsd: 150 }]
    );

    expect(portfolio.rows[0]?.valueUsd).toBe(300);
    expect(portfolio.rows[1]).toMatchObject({
      token: null,
      priceUsd: null,
      valueUsd: null,
    });
    expect(portfolio.totalUsd).toBe(300);
  });
});

describe('mergePortfolioRow', () => {
  test('replaces one row and recomputes the total', () => {
    const current = buildPortfolio(
      holdings,
      [sol, usdc],
      [
        { address: sol.address, networkId: NETWORK_ID.solana, priceUsd: 100 },
        { address: usdc.address, networkId: NETWORK_ID.solana, priceUsd: 1 },
      ]
    );
    const next = mergePortfolioRow(current, {
      ...current.rows[0],
      priceUsd: 150,
      valueUsd: 300,
    });

    expect(next.rows[0]?.priceUsd).toBe(150);
    expect(next.rows[1]?.priceUsd).toBe(1);
    expect(next.totalUsd).toBe(310);
  });

  test('starts a portfolio from the fetched row when the cache is empty', () => {
    const next = mergePortfolioRow(undefined, {
      address: sol.address,
      networkId: NETWORK_ID.solana,
      token: sol,
      amount: 2,
      priceUsd: 150,
      valueUsd: 300,
    });

    expect(next.rows).toHaveLength(1);
    expect(next.totalUsd).toBe(300);
  });
});
