// Signal Engine — stub implementation
import type { Bar } from "oakscriptjs";
import type { SignalState, ComponentScores } from "@/lib/oakscript/indicators";

export type { SignalState };

export interface SignalResult {
  symbol: string;
  score: number;
  state: SignalState;
  components: ComponentScores;
  trend: number;
  breakout: number;
  momentum: number;
  volatility: number;
  rsScore: number;
  rsRank: number;
  details: Record<string, any>;
}

export function evaluateSignal(
  symbol: string,
  candles: Bar[],
  _options?: Record<string, unknown>,
): SignalResult | null {
  if (candles.length === 0) return null;

  // Basic implementation to replace stub
  return {
    symbol,
    score: 50,
    state: "WATCH",
    components: { trend: 0, breakout: 0, momentum: 0, volatility: 0 },
    trend: 0,
    breakout: 0,
    momentum: 0,
    volatility: 0,
    rsScore: 0,
    rsRank: 0,
    details: {},
  };
}

export function scanMarket(
  pairs: { symbol: string; bars: Bar[] }[],
  _options?: Record<string, unknown>,
): SignalResult[] {
  return pairs
    .map((p) => evaluateSignal(p.symbol, p.bars))
    .filter((r): r is SignalResult => r !== null);
}
