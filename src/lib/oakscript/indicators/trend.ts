// Trend Indicator — public stub
import type { IndicatorResult, BarData, Bar } from "oakscriptjs";

export interface TrendOptions {
  smaPeriod?: number;
  lookback?: number;
}

export interface TrendResult extends IndicatorResult {
  isTrending: boolean;
  sma20Value: number;
}

export function trendIndicator(
  _bars: BarData | Bar[],
  _options?: TrendOptions,
): TrendResult | null {
  return null;
}
