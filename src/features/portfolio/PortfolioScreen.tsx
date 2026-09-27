import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { apiErrorMessage } from '@/api/client';
import { AssetRow } from '@/components/AssetRow';
import type { TokenId } from '@/domain/types';
import { usePortfolio } from '@/features/portfolio/usePortfolio';
import { ThemedText } from '@/ui/ThemedText';
import { ThemedView } from '@/ui/ThemedView';
import { MaxContentWidth, Spacing } from '@/ui/theme';
import { useTheme } from '@/ui/useTheme';
import { formatUsd } from '@/utils/format';
import { tokenKey } from '@/utils/token';

const strings = {
  loading: 'Loading portfolio…',
  tapToRetry: 'Tap to retry.',
};

const EMPTY_PORTFOLIO = { rows: [], totalUsd: 0 };

function openToken(token: TokenId) {
  router.push({
    pathname: '/token/[networkId]/[address]',
    params: {
      networkId: String(token.networkId),
      address: token.address,
    },
  });
}

export function PortfolioScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: portfolio = EMPTY_PORTFOLIO,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = usePortfolio({ live: true });
  const hasAnyValue = portfolio.rows.some((row) => row.valueUsd !== null);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <FlashList
          data={portfolio.rows}
          keyExtractor={(holding) => tokenKey(holding)}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.totalRow}>
                <ThemedText type="title" style={styles.total}>
                  {formatUsd(
                    isPending || !hasAnyValue ? null : portfolio.totalUsd
                  )}
                </ThemedText>
                {isFetching && !isPending ? (
                  <ActivityIndicator
                    color={theme.textSecondary}
                    style={styles.refreshIndicator}
                  />
                ) : null}
              </View>
              {isPending ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {strings.loading}
                </ThemedText>
              ) : null}
              {isError ? (
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  onPress={() => refetch()}
                >
                  {apiErrorMessage(error)} {strings.tapToRetry}
                </ThemedText>
              ) : null}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.text}
              colors={[theme.text]}
            />
          }
          renderItem={({ item }) => (
            <AssetRow
              address={item.address}
              networkId={item.networkId}
              amount={item.amount}
              name={item.token?.name}
              symbol={item.token?.symbol}
              uri={item.token?.logoUrl}
              onPress={openToken}
            />
          )}
        />
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
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingTop:
      Platform.OS === 'web' ? Spacing.six + Spacing.four : Spacing.five,
    marginBottom: Spacing.four,
  },
  totalRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  total: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: 'center',
  },
  refreshIndicator: {
    position: 'absolute',
    left: '100%',
    marginLeft: Spacing.three,
  },
});
