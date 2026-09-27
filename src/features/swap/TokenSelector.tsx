import { BottomSheet, RNHostView } from '@expo/ui';
import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssetRow } from '@/components/AssetRow';
import { TokenImage } from '@/components/TokenImage';
import type { TokenId } from '@/domain/types';
import { useSwapTokens } from '@/features/swap/useSwapTokens';
import type { SwapAmountSide } from '@/features/swap/swapUi';
import { ThemedText } from '@/ui/ThemedText';
import { Spacing } from '@/ui/theme';
import { useTheme } from '@/ui/useTheme';
import { sameToken } from '@/utils/token';
import { FlashList } from '@shopify/flash-list';

const strings = {
  closeList: 'Close token list',
  done: 'Done',
  searchPlaceholder: 'Search name or address',
  searchTokens: 'Search tokens',
  noMatches: 'No tokens match that search.',
  select: 'Select',
  chevron: '▾',
  changeToken: (label: string, symbol: string) =>
    `${label}: ${symbol}. Change token.`,
  chooseToken: (label: string) =>
    `${label}: no token selected. Choose a token.`,
};

type TokenSelectorProps = {
  side: SwapAmountSide;
  label: string;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Trigger and sheet for choosing a swap token. The list itself comes from
 * useSwapTokens.
 */
export function TokenSelector({
  side,
  label,
  onOpenChange,
}: TokenSelectorProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const {
    tokens,
    inputToken,
    outputToken,
    inputTokenId,
    outputTokenId,
    setInputTokenId,
    setOutputTokenId,
  } = useSwapTokens(open);
  const selected = side === 'input' ? inputTokenId : outputTokenId;
  const token = side === 'input' ? inputToken : outputToken;
  const exclude = side === 'input' ? outputTokenId : inputTokenId;
  const setTokenId = side === 'input' ? setInputTokenId : setOutputTokenId;
  const visibleTokens = useMemo(() => {
    const available =
      exclude == null
        ? tokens
        : tokens.filter((item) => !sameToken(item, exclude));
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return available;
    }
    return available.filter((item) => {
      return (
        item.symbol.toLowerCase().includes(needle) ||
        item.name.toLowerCase().includes(needle) ||
        item.address.toLowerCase().includes(needle)
      );
    });
  }, [exclude, query, tokens]);

  function close() {
    setOpen(false);
    setQuery('');
    onOpenChange?.(false);
  }

  function choose(id: TokenId) {
    const picked = tokens.find((item) => sameToken(item, id));
    if (!picked || (exclude != null && sameToken(picked, exclude))) {
      return;
    }
    setTokenId(picked);
    close();
  }

  const isWeb = Platform.OS === 'web';
  // Web sheet auto-sizes up to 85vh. Keep the list inside that, minus the drag handle.
  const webSheetHeight = Math.max(320, Math.round(windowHeight * 0.85) - 56);
  const listHeight = Math.max(240, windowHeight - insets.top - insets.bottom);

  const sheet = (
    <View style={[styles.sheet, isWeb && { height: webSheetHeight }]}>
      <View style={[styles.chrome, { backgroundColor: theme.background }]}>
        <View style={styles.sheetHeader}>
          <ThemedText type="smallBold">{label}</ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.closeList}
            onPress={close}
            hitSlop={12}
          >
            <ThemedText type="linkPrimary">{strings.done}</ThemedText>
          </Pressable>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={strings.searchPlaceholder}
          placeholderTextColor={theme.textSecondary}
          autoCorrect={false}
          autoCapitalize="none"
          style={[
            styles.search,
            {
              color: theme.text,
              backgroundColor: theme.backgroundElement,
            },
          ]}
          accessibilityLabel={strings.searchTokens}
        />
      </View>
      <FlashList
        data={visibleTokens}
        keyExtractor={(item) => `${item.networkId}:${item.address}`}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={
          isWeb
            ? styles.list
            : {
                flexGrow: 0,
                height: listHeight,
              }
        }
        contentContainerStyle={[
          styles.listContent,
          { backgroundColor: theme.background },
        ]}
        ListEmptyComponent={
          <ThemedText type="small" themeColor="textSecondary">
            {strings.noMatches}
          </ThemedText>
        }
        renderItem={({ item }) => (
          <AssetRow
            address={item.address}
            networkId={item.networkId}
            amount={item.amount}
            name={item.name}
            symbol={item.symbol}
            uri={item.logoUrl}
            selected={selected != null && sameToken(item, selected)}
            onPress={choose}
          />
        )}
      />
    </View>
  );

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          token
            ? strings.changeToken(label, token.symbol)
            : strings.chooseToken(label)
        }
        onPress={() => {
          setOpen(true);
          onOpenChange?.(true);
        }}
        style={[styles.trigger, { backgroundColor: theme.backgroundSelected }]}
      >
        {token ? (
          <TokenImage uri={token.logoUrl} symbol={token.symbol} size={28} />
        ) : null}
        <ThemedText type="smallBold">
          {token?.symbol ?? strings.select}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {strings.chevron}
        </ThemedText>
      </Pressable>

      <BottomSheet
        isPresented={open}
        onDismiss={close}
        snapPoints={isWeb ? undefined : ['half', 'full']}
        containerColor={theme.background}
        contentPadding={0}
      >
        {Platform.OS === 'web' ? sheet : <RNHostView>{sheet}</RNHostView>}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  sheet: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
  },
  chrome: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 1,
      },
      default: {},
    }),
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.two,
  },
  search: {
    width: '100%',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    marginBottom: Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.twelve,
  },
});
