import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuoteResult } from '@/features/swap/QuoteResult';
import { SwapLeg } from '@/features/swap/SwapLeg';
import { useSwapQuote } from '@/features/swap/useSwapQuote';
import { useSwapTokens } from '@/features/swap/useSwapTokens';
import { holdingCoversAmount } from '@/features/swap/utils';
import { useSwapUi } from '@/features/swap/swapUi';
import { ThemedText } from '@/ui/ThemedText';
import { ThemedView } from '@/ui/ThemedView';
import { MaxContentWidth, Spacing } from '@/ui/theme';
import { useTheme } from '@/ui/useTheme';
import { sameToken } from '@/utils/token';

const strings = {
  flipTokens: 'Flip tokens',
  insufficientBalance: 'Insufficient balance',
  swap: 'Swap',
  review: (
    inAmount: string,
    inSymbol: string,
    outAmount: string,
    outSymbol: string
  ) =>
    `Pay ${inAmount} ${inSymbol}\nReceive ${outAmount} ${outSymbol}\n\nSwaps are not executed.`,
};

function showSwapPreview(message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${strings.swap}\n\n${message}`);
    return;
  }
  Alert.alert(strings.swap, message);
}

/**
 * Main screen for the swap feature. It displays the swap legs and the quote result.
 * The screen allows the user to select a token and enter an amount. It also
 * displays the quote result and the swap button.
 */
export function SwapScreen() {
  const theme = useTheme();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { lastEdited, inputAmountText, outputAmountText, flip } = useSwapUi();
  const { inputToken, outputToken } = useSwapTokens();
  const amountText =
    lastEdited === 'input' ? inputAmountText : outputAmountText;
  const quote = useSwapQuote({
    inputToken,
    outputToken,
    amountText,
    exactSide: lastEdited,
  });
  const hasEnoughBalance = Boolean(
    inputToken &&
    quote.hasQuote &&
    quote.data &&
    holdingCoversAmount(
      inputToken.amount,
      inputToken.decimals,
      quote.data.inAmountAtomic
    )
  );

  const addressesDiffer = !sameToken(inputToken, outputToken);
  const canSwap = quote.hasQuote && hasEnoughBalance && addressesDiffer;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!selectorOpen}
          contentContainerStyle={styles.content}
        >
          <View style={styles.legs}>
            <SwapLeg
              side="input"
              quotedAmountText={quote.quotedAmountText}
              hasQuote={quote.hasQuote}
              onOpenChange={setSelectorOpen}
            />

            <SwapLeg
              side="output"
              quotedAmountText={quote.quotedAmountText}
              hasQuote={quote.hasQuote}
              onOpenChange={setSelectorOpen}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={strings.flipTokens}
              onPress={flip}
              hitSlop={12}
              style={[
                styles.flip,
                {
                  backgroundColor: theme.backgroundSelected,
                  borderColor: theme.background,
                },
              ]}
            >
              <Image
                source={require('@/assets/images/swap/flip.png')}
                style={styles.flipIcon}
                contentFit="contain"
                tintColor={theme.text}
              />
            </Pressable>
          </View>

          <QuoteResult
            hasOutput={outputToken != null}
            amountText={amountText}
            liveAtomic={quote.liveAtomic}
            addressesDiffer={addressesDiffer}
            isQuotePending={quote.isQuotePending}
            isError={quote.isError}
            error={quote.error}
            priceImpactPct={quote.data?.priceImpactPct}
            onRetry={() => quote.refetch()}
          />
        </ScrollView>
        <View style={[styles.swapBar, { backgroundColor: theme.background }]}>
          <Pressable
            onPress={() => {
              const quoted = quote.data;
              if (!quoted || !inputToken || !outputToken) {
                return;
              }
              showSwapPreview(
                strings.review(
                  quoted.inAmountAtomic,
                  inputToken.symbol,
                  quoted.outAmountAtomic,
                  outputToken.symbol
                )
              );
            }}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSwap }}
            disabled={!canSwap}
            style={[
              styles.swap,
              {
                backgroundColor: canSwap
                  ? theme.backgroundSelected
                  : theme.backgroundElement,
                opacity: canSwap ? 1 : 0.5,
              },
            ]}
          >
            <ThemedText type="smallBold">
              {quote.hasQuote && !hasEnoughBalance
                ? strings.insufficientBalance
                : strings.swap}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  legs: {
    position: 'relative',
    gap: Spacing.two,
  },
  flip: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 1,
    width: 40,
    height: 40,
    marginTop: -20,
    marginLeft: -20,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipIcon: {
    width: 20,
    height: 20,
  },
  swapBar: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  swap: {
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
