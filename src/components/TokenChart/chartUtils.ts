import { formatUsd } from '@/utils/format';

const AXIS_LABEL_HOURS = 3;

export type ChartPoint = {
  timestamp: number;
  value: number;
};

export type CodexBars = {
  t: number[];
  c: (number | null)[];
};

/**
 * Converts Codex API bars to chart points.
 */
export function barsToChartPoints(bars: CodexBars): ChartPoint[] {
  const length = Math.min(bars.t.length, bars.c.length);
  const points: ChartPoint[] = [];

  for (let index = 0; index < length; index += 1) {
    const timestamp = bars.t[index];
    const value = bars.c[index];
    if (
      timestamp === undefined ||
      value === null ||
      value === undefined ||
      !Number.isFinite(value)
    ) {
      continue;
    }
    points.push({ timestamp, value });
  }

  return points;
}

/** Top and bottom buffer factor for the y-axis's min and max values. */
const Y_AXIS_BUFFER_FACTOR = 0.1;

/**
 * Calculates the y-axis bounds for a given set of chart points.
 */
export function yAxisBounds(points: ChartPoint[]) {
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const buffer =
    span === 0
      ? Math.abs(min) * Y_AXIS_BUFFER_FACTOR || 1
      : span * Y_AXIS_BUFFER_FACTOR;
  const yMin = min - buffer;
  const yMax = max + buffer;

  return {
    yAxisOffset: yMin,
    maxValue: yMax - yMin,
  };
}

export function axisHourLabel(
  unixSeconds: number,
  axisLabelHours: number = AXIS_LABEL_HOURS
): string | null {
  const date = new Date(unixSeconds * 1000);
  const hour = date.getHours();
  if (date.getMinutes() !== 0 || hour % axisLabelHours !== 0) {
    return null;
  }
  const hour12 = hour % 12 || 12;
  return `${hour12}${hour < 12 ? 'a' : 'p'}`;
}

export function formatAxisUsd(value: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }
  if (Math.abs(value) >= 1) {
    return `$${Math.round(value)}`;
  }
  return formatUsd(value);
}
