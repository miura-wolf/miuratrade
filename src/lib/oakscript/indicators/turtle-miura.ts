// Turtle Miura Strategy — public stub
// Full strategy available in private fork
import type { IndicatorResult, BarData, Bar } from "oakscriptjs";
import type {
  TrendOptions,
  BreakoutOptions,
  MomentumOptions,
  VolatilityOptions,
} from "./index";

export type SignalState =
  | "HIGH PRIORITY"
  | "STRONG"
  | "WATCH"
  | "WEAK"
  | "AVOID";

export interface ComponentScores {
  trend: number;
  breakout: number;
  momentum: number;
  volatility: number;
}

export interface TurtleMiuraOptions {
  trend?: TrendOptions;
  breakout?: BreakoutOptions;
  momentum?: MomentumOptions;
  volatility?: VolatilityOptions;
}

export interface TurtleMiuraResult extends IndicatorResult {
  score: number;
  state: SignalState;
  components: ComponentScores;
  details: {
    price: number;
    sma20: number;
    rsi: number;
    atr: number;
  };
}

export function turtleMiuraIndicator(
  _bars: BarData | Bar[],
  _options?: TurtleMiuraOptions,
): TurtleMiuraResult | null {
  return null;
}
