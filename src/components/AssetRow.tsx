import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { TokenImage } from '@/components/TokenImage';
import type { TokenId } from '@/domain/types';
import { usePortfolioRow } from '@/features/portfolio/usePortfolio';
import { ThemedText } from '@/ui/ThemedText';
import { Spacing } from '@/ui/theme';
import { useTheme } from '@/ui/useTheme';
import { formatTokenAmount, formatUsd } from '@/utils/format';

const strings = {
  priceUnavailable: 'Price unavailable',
  balance: (amount: string, symbol: string) => `${amount} ${symbol}`,
};

type AssetRowProps = {
  address: TokenId['address'];
  networkId: TokenId['networkId'];
  amount: number;
  name?: string;
  symbol?: string;
  uri?: string;
  onPress: (token: TokenId) => void;
  selected?: boolean;
};

/**
 * A row in the portfolio screen that displays a token's details.
 *
 * If the token is found in the portfolio, it will used the cached information
 * in the component.
 */
export const AssetRow = memo(function AssetRow({
  address,
  networkId,
  amount,
  name,
  symbol,
  uri,
  onPress,
  selected = false,
}: AssetRowProps) {
  const theme = useTheme();
  const id = { address, networkId };
  const { data: row, isPending } = usePortfolioRow(id);
  const inPortfolio = row != null;
  const symbolLabel = symbol || address.slice(0, 4);
  const title = name || symbolLabel;
  const subtitle = inPortfolio
    ? strings.balance(
        formatTokenAmount(amount, row.token?.decimals ?? 6),
        symbolLabel
      )
    : symbolLabel;
  const priceLabel = formatUsd(row?.priceUsd);
  const valueLabel = formatUsd(row?.valueUsd);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(id)}
      style={[
        styles.row,
        {
          backgroundColor: selected
            ? theme.backgroundSelected
            : theme.backgroundElement,
        },
      ]}
    >
      <View style={styles.identity}>
        <TokenImage uri={uri} symbol={symbolLabel} />
        <View style={styles.labels}>
          <ThemedText type="smallBold">{title}</ThemedText>
          {subtitle && (
            <ThemedText type="small" themeColor="textSecondary">
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>
      {inPortfolio ? (
        <View style={styles.values}>
          <ThemedText type="smallBold">{valueLabel}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {row.priceUsd === null && !isPending
              ? strings.priceUnavailable
              : priceLabel}
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
    minWidth: 0,
  },
  labels: {
    gap: Spacing.half,
  },
  values: {
    alignItems: 'flex-end',
    gap: Spacing.half,
  },
});
