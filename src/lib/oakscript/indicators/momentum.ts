// Momentum Indicator — public stub
import type { IndicatorResult, BarData, Bar } from "oakscriptjs";

export interface MomentumOptions {
  rsiPeriod?: number;
}

export interface MomentumResult extends IndicatorResult {
  isBullish: boolean;
  rsiValue: number;
}

export function momentumIndicator(
  _bars: BarData | Bar[],
  _options?: MomentumOptions,
): MomentumResult | null {
  return null;
}
