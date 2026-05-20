// Breakout Indicator — public stub
import type { IndicatorResult, BarData, Bar } from "oakscriptjs";

export interface BreakoutOptions {
  rangePeriod?: number;
  volumeMult?: number;
}

export interface BreakoutResult extends IndicatorResult {
  isBreakout: boolean;
  volumeExpanded: boolean;
}

export function breakoutIndicator(
  _bars: BarData | Bar[],
  _options?: BreakoutOptions,
): BreakoutResult | null {
  return null;
}
