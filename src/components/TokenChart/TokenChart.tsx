import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { apiErrorMessage } from '@/api/client';
import { CHART_WINDOW_CONFIG } from '@/api/codex/getTokenBars';
import {
  axisHourLabel,
  formatAxisUsd,
  yAxisBounds,
  type ChartPoint,
} from '@/components/TokenChart/chartUtils';
import { useTokenChart } from '@/components/TokenChart/useTokenChart';
import type { Address, NetworkId } from '@/domain/types';
import { ThemedText } from '@/ui/ThemedText';
import { Spacing } from '@/ui/theme';
import { useTheme } from '@/ui/useTheme';
import { formatUsd } from '@/utils/format';

const strings = {
  loading: 'Loading chart…',
  retry: (message: string) => `${message} Tap to retry.`,
  notEnoughHistory: 'Not enough price history for a chart.',
  window: (symbol: string) => `${symbol} · 24h`,
};

const CHART_PLOT_HEIGHT = 180;
const Y_AXIS_LABEL_WIDTH = 56;
const AXIS_EDGE_SPACING = 8;
const AXIS_LABEL_WIDTH = 24;

type TokenChartProps = {
  address: Address;
  networkId: NetworkId;
  symbol: string;
};

export function TokenChart({ address, networkId, symbol }: TokenChartProps) {
  const theme = useTheme();
  const chartQuery = useTokenChart(
    address,
    networkId,
    CHART_WINDOW_CONFIG['ONE_DAY']
  );
  const points = chartQuery.data ?? [];
  const latest = points.at(-1);
  const [containerWidth, setContainerWidth] = useState(0);
  const plotWidth = Math.max(
    containerWidth - Y_AXIS_LABEL_WIDTH - AXIS_EDGE_SPACING - Spacing.three,
    0
  );
  const [chartSlotHeight, setChartSlotHeight] = useState(CHART_PLOT_HEIGHT);

  function onContainerLayout(event: LayoutChangeEvent) {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    setContainerWidth((current) =>
      current === nextWidth ? current : nextWidth
    );
  }

  function onChartLayout(event: LayoutChangeEvent) {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    setChartSlotHeight((current) =>
      current === nextHeight ? current : nextHeight
    );
  }

  let chartMessage: string | null = null;
  if (chartQuery.isPending) {
    chartMessage = strings.loading;
  } else if (chartQuery.isError) {
    chartMessage = strings.retry(apiErrorMessage(chartQuery.error));
  } else if (points.length < 2) {
    chartMessage = strings.notEnoughHistory;
  }

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <View style={styles.titleRow}>
        <ThemedText type="smallBold">{strings.window(symbol)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {latest ? formatUsd(latest.value) : ' '}
        </ThemedText>
      </View>

      <View style={[styles.chartSlot, { minHeight: chartSlotHeight }]}>
        {chartMessage ? (
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.chartMessage}
            onPress={
              chartQuery.isError ? () => chartQuery.refetch() : undefined
            }
          >
            {chartMessage}
          </ThemedText>
        ) : containerWidth > 0 ? (
          <View onLayout={onChartLayout}>
            <LineChart
              data={toLineData(points, theme.textSecondary)}
              {...yAxisBounds(points)}
              width={plotWidth}
              height={CHART_PLOT_HEIGHT}
              curved
              thickness={2}
              color="#3c87f7"
              hideDataPoints
              disableScroll
              adjustToWidth
              initialSpacing={AXIS_EDGE_SPACING}
              endSpacing={AXIS_EDGE_SPACING}
              noOfSections={4}
              yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
              formatYLabel={(label) => formatAxisUsd(Number(label))}
              yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
              yAxisColor={theme.backgroundSelected}
              xAxisColor={theme.backgroundSelected}
              rulesColor={theme.backgroundSelected}
              backgroundColor={theme.background}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function toLineData(points: ChartPoint[], color: string) {
  return points.map((point) => {
    const label = axisHourLabel(point.timestamp);
    return {
      value: point.value,
      labelComponent:
        label == null
          ? undefined
          : () => <HourAxisLabel label={label} color={color} />,
    };
  });
}

function HourAxisLabel({ label, color }: { label: string; color: string }) {
  return (
    <Text
      allowFontScaling={false}
      style={{
        width: AXIS_LABEL_WIDTH,
        color,
        fontSize: 10,
        textAlign: 'center',
      }}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  titleRow: {
    paddingStart: Spacing.two,
    paddingEnd: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartSlot: {
    alignItems: 'flex-start',
  },
  chartMessage: {
    alignSelf: 'stretch',
    textAlign: 'center',
  },
});
