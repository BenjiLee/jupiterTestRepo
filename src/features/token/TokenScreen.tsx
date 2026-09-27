import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { apiErrorMessage } from '@/api/client';
import { TokenChart } from '@/components/TokenChart/TokenChart';
import { TokenImage } from '@/components/TokenImage';
import { UNKNOWN_SYMBOL } from '@/domain/tokens';
import type { Address, NetworkId } from '@/domain/types';
import { useToken } from '@/features/token/useToken';
import { ThemedText } from '@/ui/ThemedText';
import { ThemedView } from '@/ui/ThemedView';
import { MaxContentWidth, Spacing } from '@/ui/theme';
import { formatTokenAmount, formatUsd } from '@/utils/format';

const strings = {
  token: 'Token',
  missingToken: 'Missing token.',
  missingAmount: '-',
  balance: (amount: string, symbol: string) => `${amount} ${symbol}`,
  tapToRetry: 'Tap to retry.',
};

type TokenScreenProps = {
  address: Address;
  networkId: NetworkId | null;
};

export function TokenScreen({ address, networkId }: TokenScreenProps) {
  const token = useToken({ address, networkId });
  const { data: row } = token;
  const amount = row?.amount;
  const symbol = row?.token?.symbol ?? UNKNOWN_SYMBOL;
  const name = row?.token?.name ?? UNKNOWN_SYMBOL;
  const valueLabel = formatUsd(row?.valueUsd);

  if (!address || networkId == null) {
    return (
      <ThemedView style={styles.screen}>
        <Stack.Screen options={{ title: strings.token }} />
        <ThemedText type="small" themeColor="textSecondary">
          {strings.missingToken}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: symbol }} />
      <View style={styles.content}>
        <View style={styles.identity}>
          <TokenImage uri={row?.token?.logoUrl} symbol={symbol} />
          <View style={styles.labels}>
            <ThemedText type="subtitle">{name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {symbol}
            </ThemedText>
          </View>

          <View style={styles.values}>
            <ThemedText type="smallBold">{valueLabel}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {amount == null
                ? strings.missingAmount
                : strings.balance(
                    formatTokenAmount(amount, row?.token?.decimals ?? 6),
                    symbol
                  )}
            </ThemedText>
          </View>
        </View>
        {token.isError ? (
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.error}
            onPress={() => token.refetch()}
          >
            {apiErrorMessage(token.error)} {strings.tapToRetry}
          </ThemedText>
        ) : null}
        <TokenChart address={address} networkId={networkId} symbol={symbol} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingTop: Spacing.three,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  labels: {
    flex: 1,
    gap: Spacing.half,
  },
  error: {
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  values: {
    alignItems: 'flex-end',
    gap: Spacing.half,
  },
});
