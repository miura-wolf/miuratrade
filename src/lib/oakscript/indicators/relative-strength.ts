// Relative Strength — public stub
import type { IndicatorResult, BarData, Bar } from "oakscriptjs";

export interface RelativeStrengthOptions {}

export interface RelativeStrengthResult extends IndicatorResult {
  symbol: string;
  rsScore: number;
  components: {
    momentumQuality: number;
    breakoutQuality: number;
    volumeParticipation: number;
  };
}

export function relativeStrength(
  _bars: BarData | Bar[],
  _options?: RelativeStrengthOptions,
): RelativeStrengthResult | null {
  return null;
}

export function rankByRelativeStrength(
  _pairs: { symbol: string; bars: BarData | Bar[] }[],
  _options?: RelativeStrengthOptions,
): RelativeStrengthResult[] {
  return [];
}
