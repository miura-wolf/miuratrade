// Signal Engine — full implementation using oakscript indicators
import type { Bar } from "oakscriptjs";
import type { SignalState, ComponentScores } from "@/lib/oakscript/indicators";
import { turtleMiuraIndicator } from "@/lib/oakscript/indicators/turtle-miura";
import { relativeStrength, rankByRelativeStrength } from "@/lib/oakscript/indicators/relative-strength";

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
  if (candles.length < 30) return null;

  const miura = turtleMiuraIndicator(candles);
  if (!miura) return null;

  const rs = relativeStrength(symbol, candles);

  return {
    symbol,
    score: miura.score,
    state: miura.state,
    components: miura.components,
    trend: miura.components.trend,
    breakout: miura.components.breakout,
    momentum: miura.components.momentum,
    volatility: miura.components.volatility,
    rsScore: rs?.rsScore ?? 0,
    rsRank: 0,
    details: miura.details,
  };
}

export function scanMarket(
  pairs: { symbol: string; bars?: Bar[]; candles?: Bar[] }[],
  _options?: Record<string, unknown>,
): SignalResult[] {
  const results = pairs
    .map((p) => evaluateSignal(p.symbol, p.bars ?? p.candles ?? []))
    .filter((r): r is SignalResult => r !== null);

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Assign RS ranks
  const rsRanked = rankByRelativeStrength(
    pairs.map((p) => ({ symbol: p.symbol, bars: p.bars ?? p.candles ?? [] })),
  );

  for (const r of results) {
    const rank = rsRanked.findIndex((rr) => rr.symbol === r.symbol);
    r.rsRank = rank >= 0 ? rank + 1 : results.length;
  }

  return results;
}
