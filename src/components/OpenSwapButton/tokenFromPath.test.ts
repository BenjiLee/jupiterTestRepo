import { tokenFromPath } from '@/components/OpenSwapButton/tokenFromPath';
import { NETWORK_ID } from '@/domain/types';

test.each`
  path                                                                | expected
  ${'/token/1399811149/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'} | ${{ address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', networkId: NETWORK_ID.solana }}
  ${'/token/1399811149/JMxJLZ7DFhF1zFh7sdcfkoCwKw4PBZDzp1MbUi1bSp3K'} | ${{ address: 'JMxJLZ7DFhF1zFh7sdcfkoCwKw4PBZDzp1MbUi1bSp3K', networkId: NETWORK_ID.solana }}
  ${'/token/245022934/XMPLPRDNonSolAddress'}                          | ${null}
  ${'/token/245022934/0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'}    | ${null}
  ${'/something-else'}                                                | ${null}
  ${'/token/1399811149'}                                              | ${null}
  ${'/token'}                                                         | ${null}
  ${'/'}                                                              | ${null}
  ${'23948948324'}                                                    | ${null}
`('reads the token id from a token route ($path)', ({ path, expected }) => {
  expect(tokenFromPath(path)).toEqual(expected);
});
