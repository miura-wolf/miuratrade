// Signal Engine — public stub
// Full strategy engine available in private fork
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
  _symbol: string,
  _candles: Bar[],
  _options?: Record<string, unknown>,
): SignalResult | null {
  return null;
}

export function scanMarket(
  _pairs: { symbol: string; bars: Bar[] }[],
  _options?: Record<string, unknown>,
): SignalResult[] {
  return [];
}
