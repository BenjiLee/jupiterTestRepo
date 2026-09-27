import { StyleSheet, TextInput, View } from 'react-native';

import { UNKNOWN_SYMBOL } from '@/domain/tokens';
import type { TokenId } from '@/domain/types';
import { TokenSelector } from '@/features/swap/TokenSelector';
import { useSwapPrices } from '@/features/swap/useSwapPrices';
import { useSwapTokens } from '@/features/swap/useSwapTokens';
import { useSwapUi, type SwapAmountSide } from '@/features/swap/swapUi';
import { ThemedText } from '@/ui/ThemedText';
import { Spacing } from '@/ui/theme';
import { useTheme } from '@/ui/useTheme';
import { usdNotional } from '@/utils/amount';
import { formatTokenAmount, formatUsd } from '@/utils/format';
import { tokenKey } from '@/utils/token';

const strings = {
  from: 'From',
  to: 'To',
  amountPlaceholder: '0.0',
  missingBalance: '-',
  token: 'token',
  amountToSwap: (symbol: string) => `Amount of ${symbol} to swap`,
  amountToReceive: (symbol: string) => `Amount of ${symbol} to receive`,
  balance: (amount: string, symbol: string) => `${amount} ${symbol}`,
};

type SwapLegProps = {
  side: SwapAmountSide;
  /** The quoted amount to display on the opposite side of the leg. */
  quotedAmountText: string;
  /** Whether the leg has a quote. */
  hasQuote: boolean;
  /** Callback to open the token selector. */
  onOpenChange?: (open: boolean) => void;
};

/**
 * Component displayed on the swap screen to allow the user to select a
 * token and enter an amount. The component displays the token selector and
 * the input field for the amount. It also displays the balance of the token
 * and the value of the amount in USD.
 */
export function SwapLeg({
  side,
  quotedAmountText,
  hasQuote,
  onOpenChange,
}: SwapLegProps) {
  const theme = useTheme();
  const label = side === 'input' ? strings.from : strings.to;
  const {
    lastEdited,
    inputAmountText,
    outputAmountText,
    setInputAmountText,
    setOutputAmountText,
  } = useSwapUi();
  const { inputToken, outputToken, inputTokenId, outputTokenId } =
    useSwapTokens();
  const { selected, token, amountText, setAmountText } =
    side === 'input'
      ? {
          selected: inputTokenId,
          token: inputToken,
          amountText: inputAmountText,
          setAmountText: setInputAmountText,
        }
      : {
          selected: outputTokenId,
          token: outputToken,
          amountText: outputAmountText,
          setAmountText: setOutputAmountText,
        };
  /** Side which is the user is editing. The other side will become the quoted amount. */
  const isEditing = lastEdited === side;
  const amountValue = isEditing ? amountText : quotedAmountText;
  const { data: prices } = useSwapPrices(
    [inputTokenId, outputTokenId].filter((id): id is TokenId => id != null)
  );
  const priceUsd = selected ? prices?.[tokenKey(selected)] : undefined;
  const symbol = token?.symbol ?? UNKNOWN_SYMBOL;
  const balance = token?.amount ?? 0;
  const valueUsd = usdNotional({
    amountText: amountValue,
    enabled: selected != null && (isEditing || hasQuote),
    priceUsd,
  });
  const accessibilityLabel =
    side === 'input'
      ? strings.amountToSwap(token?.symbol ?? strings.token)
      : strings.amountToReceive(token?.symbol ?? strings.token);

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="smallBold" style={styles.legLabel}>
        {label}
      </ThemedText>
      <View style={styles.inputRow}>
        <TextInput
          value={amountValue}
          onChangeText={setAmountText}
          keyboardType="decimal-pad"
          placeholder={strings.amountPlaceholder}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          accessibilityLabel={accessibilityLabel}
        />
        <TokenSelector side={side} label={label} onOpenChange={onOpenChange} />
      </View>
      <View style={styles.meta}>
        {valueUsd !== undefined && (
          <ThemedText type="small" themeColor="textSecondary">
            {formatUsd(valueUsd)}
          </ThemedText>
        )}
        <ThemedText type="small" themeColor="textSecondary">
          {token
            ? strings.balance(
                formatTokenAmount(balance, token.decimals),
                symbol
              )
            : strings.missingBalance}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legLabel: {
    marginBottom: Spacing.two,
  },
  card: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 28,
    lineHeight: 34,
    paddingVertical: Spacing.one,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
});
