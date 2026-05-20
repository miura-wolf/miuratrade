// Volatility Indicator — public stub
import type { IndicatorResult, BarData, Bar } from "oakscriptjs";

export interface VolatilityOptions {
  atrPeriod?: number;
  thresholdMult?: number;
}

export interface VolatilityResult extends IndicatorResult {
  isHealthy: boolean;
  atrValue: number;
}

export function volatilityIndicator(
  _bars: BarData | Bar[],
  _options?: VolatilityOptions,
): VolatilityResult | null {
  return null;
}
