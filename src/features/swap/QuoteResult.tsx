import { StyleSheet } from 'react-native';

import { apiErrorMessage } from '@/api/client';
import { ThemedText } from '@/ui/ThemedText';
import { ThemedView } from '@/ui/ThemedView';
import { Spacing } from '@/ui/theme';
import { useTheme } from '@/ui/useTheme';
import { formatImpact } from '@/utils/format';

const strings = {
  enterAmount: 'Enter an amount to see a quote.',
  chooseToken: 'Choose a token to receive.',
  chooseTwoTokens: 'Choose two different tokens.',
  enterValidAmount: 'Enter a valid amount for this token.',
  fetchingQuote: 'Fetching quote…',
  tapToRetry: 'Tap to retry.',
  priceImpactUnavailable: 'Price impact unavailable',
  priceImpact: (impact: number) => `Price impact ${formatImpact(impact)}`,
};

type QuoteResultProps = {
  hasOutput: boolean;
  amountText: string;
  /** The active price that is being inputted, but not yet quoted. */
  liveAtomic: string | null;
  addressesDiffer: boolean;
  isQuotePending: boolean;
  isError: boolean;
  error: unknown;
  /** The price impact of the quote, as a percentage. */
  priceImpactPct?: number | null;
  onRetry: () => void;
};

/**
 * Component displayed on the swap screen to show helpful information about
 * the state of the quote. For example, if the user has not entered an amount,
 * it will show a message to enter an amount.
 */
export function QuoteResult({
  hasOutput,
  amountText,
  liveAtomic,
  addressesDiffer,
  isQuotePending,
  isError,
  error,
  priceImpactPct,
  onRetry,
}: QuoteResultProps) {
  const theme = useTheme();

  let body = <ThemedText type="small">{strings.enterAmount}</ThemedText>;

  if (!hasOutput) {
    body = <ThemedText type="small">{strings.chooseToken}</ThemedText>;
  } else if (!addressesDiffer) {
    body = <ThemedText type="small">{strings.chooseTwoTokens}</ThemedText>;
  } else if (amountText.trim() !== '' && liveAtomic === null) {
    body = <ThemedText type="small">{strings.enterValidAmount}</ThemedText>;
  } else if (liveAtomic && isQuotePending) {
    body = (
      <ThemedText type="small" themeColor="textSecondary">
        {strings.fetchingQuote}
      </ThemedText>
    );
  } else if (liveAtomic && isError) {
    body = (
      <ThemedText type="small" onPress={onRetry}>
        {apiErrorMessage(error)} {strings.tapToRetry}
      </ThemedText>
    );
  } else if (liveAtomic && priceImpactPct !== undefined) {
    body = (
      <ThemedText type="small" themeColor="textSecondary">
        {priceImpactPct === null
          ? strings.priceImpactUnavailable
          : strings.priceImpact(priceImpactPct)}
      </ThemedText>
    );
  }

  return (
    <ThemedView
      style={[styles.quote, { backgroundColor: theme.backgroundElement }]}
    >
      {body}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  quote: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
});
