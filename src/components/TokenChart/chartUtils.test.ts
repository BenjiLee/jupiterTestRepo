import {
  axisHourLabel,
  barsToChartPoints,
  yAxisBounds,
} from '@/components/TokenChart/chartUtils';

function localUnix(hour: number, minute = 0): number {
  return Math.floor(new Date(2024, 0, 2, hour, minute).getTime() / 1000);
}

describe('barsToChartPoints', () => {
  test('pairs timestamps with close prices and drops null closes', () => {
    expect(
      barsToChartPoints({
        t: [1_700_000_000, 1_700_003_600, 1_700_007_200],
        c: [10, null, 12.5],
      })
    ).toEqual([
      { timestamp: 1_700_000_000, value: 10 },
      { timestamp: 1_700_007_200, value: 12.5 },
    ]);
  });
});

describe('yAxisBounds', () => {
  test('pads the min and max by 10 percent of the span', () => {
    expect(
      yAxisBounds([
        { timestamp: 0, value: 10 },
        { timestamp: 1, value: 20 },
      ])
    ).toEqual({ yAxisOffset: 9, maxValue: 12 });
  });
});

describe('axisHourLabel', () => {
  test.each`
    hour  | minute | axisLabelHours | expected
    ${0}  | ${0}   | ${4}           | ${'12a'}
    ${4}  | ${0}   | ${4}           | ${'4a'}
    ${12} | ${0}   | ${4}           | ${'12p'}
    ${16} | ${0}   | ${4}           | ${'4p'}
    ${13} | ${0}   | ${4}           | ${null}
    ${4}  | ${15}  | ${4}           | ${null}
    ${6}  | ${0}   | ${6}           | ${'6a'}
    ${18} | ${0}   | ${6}           | ${'6p'}
    ${3}  | ${0}   | ${3}           | ${'3a'}
    ${15} | ${0}   | ${3}           | ${'3p'}
    ${8}  | ${0}   | ${8}           | ${'8a'}
    ${14} | ${0}   | ${7}           | ${'2p'}
    ${8}  | ${30}  | ${8}           | ${null}
  `(
    'labels $hour:$minute with axisLabelHours=$axisLabelHours as $expected',
    ({ hour, minute, axisLabelHours, expected }) => {
      expect(axisHourLabel(localUnix(hour, minute), axisLabelHours)).toBe(
        expected
      );
    }
  );
});
