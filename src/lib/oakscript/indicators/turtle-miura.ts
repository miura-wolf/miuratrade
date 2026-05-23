// Turtle Miura Strategy — implementation using oakscriptjs
import {
  type IndicatorResult,
  type BarData,
  type Bar,
  Series,
  BarData as BarDataClass,
  sma,
  rsi,
  atr,
  ta,
} from "oakscriptjs";
import type { TrendOptions, BreakoutOptions, MomentumOptions, VolatilityOptions } from "./index";
import { trendIndicator } from "./trend";
import { breakoutIndicator } from "./breakout";
import { momentumIndicator } from "./momentum";
import { volatilityIndicator } from "./volatility";

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

function toBars(input: BarData | Bar[]): Bar[] {
  if (input instanceof BarDataClass) return input.bars;
  return input;
}

function classifyState(score: number): SignalState {
  if (score >= 85) return "HIGH PRIORITY";
  if (score >= 65) return "STRONG";
  if (score >= 45) return "WATCH";
  if (score >= 25) return "WEAK";
  return "AVOID";
}

function scoreColor(score: number): string {
  if (score >= 85) return "#00e676";
  if (score >= 65) return "#26a69a";
  if (score >= 45) return "#ff9800";
  if (score >= 25) return "#ef5350";
  return "#b71c1c";
}

export function turtleMiuraIndicator(
  input: BarData | Bar[],
  options?: TurtleMiuraOptions,
): TurtleMiuraResult | null {
  const bars = toBars(input);
  const minBars = 30;
  if (bars.length < minBars) return null;

  // Run sub-indicators
  const trendResult = trendIndicator(input, options?.trend);
  const breakoutResult = breakoutIndicator(input, options?.breakout);
  const momentumResult = momentumIndicator(input, options?.momentum);
  const volatilityResult = volatilityIndicator(input, options?.volatility);

  // Score each component (0-25)
  let trendScore = 0;
  if (trendResult) {
    if (trendResult.isTrending) trendScore += 15;
    const closeSeries = Series.fromBars(bars, "close");
    const closeArr = closeSeries.toArray();
    const lastClose = closeArr[bars.length - 1] ?? 0;
    if (lastClose > trendResult.sma20Value) trendScore += 10;
  }

  let breakoutScore = 0;
  if (breakoutResult) {
    if (breakoutResult.isBreakout) breakoutScore += 15;
    if (breakoutResult.volumeExpanded) breakoutScore += 10;
  }

  let momentumScore = 0;
  if (momentumResult) {
    const rsiVal = momentumResult.rsiValue;
    if (rsiVal > 50 && rsiVal <= 70) momentumScore += 15;
    else if (rsiVal > 70) momentumScore += 8; // overbought, less ideal
    else if (rsiVal >= 30 && rsiVal <= 50) momentumScore += 5;
    if (momentumResult.isBullish) momentumScore += 10;
  }

  let volatilityScore = 0;
  if (volatilityResult) {
    if (volatilityResult.isHealthy) volatilityScore += 15;
    if (volatilityResult.atrVsAverage >= 0.8) volatilityScore += 10;
    else if (volatilityResult.atrVsAverage >= 0.5) volatilityScore += 5;
  }

  const components: ComponentScores = {
    trend: Math.min(25, Math.max(0, trendScore)),
    breakout: Math.min(25, Math.max(0, breakoutScore)),
    momentum: Math.min(25, Math.max(0, momentumScore)),
    volatility: Math.min(25, Math.max(0, volatilityScore)),
  };

  const score = components.trend + components.breakout + components.momentum + components.volatility;
  const state = classifyState(score);

  // Compute detail values
  const closeSeries = Series.fromBars(bars, "close");
  const smaSeries = sma(closeSeries, 20);
  const rsiSeries = rsi(closeSeries, 14);
  const atrSeries = atr(bars, 14);

  const closeArr = closeSeries.toArray();
  const smaArr = smaSeries.toArray();
  const rsiArr = rsiSeries.toArray();
  const atrArr = atrSeries.toArray();

  const lastIdx = bars.length - 1;
  const details = {
    price: closeArr[lastIdx] ?? 0,
    sma20: smaArr[lastIdx] ?? 0,
    rsi: rsiArr[lastIdx] ?? 50,
    atr: atrArr[lastIdx] ?? 0,
  };

  // Build score plot
  const scorePlot: { time: number; value: number; color?: string }[] = [];
  for (let i = 0; i < bars.length; i++) {
    // Compute a rolling score for each bar
    const rsiV = rsiArr[i] ?? 50;
    const smaV = smaArr[i] ?? 0;
    const closeV = closeArr[i] ?? 0;
    let barScore = 0;
    if (closeV > smaV) barScore += 25;
    if (rsiV > 50 && rsiV <= 70) barScore += 25;
    else if (rsiV > 70) barScore += 15;
    else if (rsiV >= 30) barScore += 10;
    // Simplified: add partial scores for breakout and volatility
    const atrV = atrArr[i] ?? 0;
    if (atrV > 0) barScore += 25; // placeholder
    if (barScore > 25) barScore += 25; // placeholder for breakout
    barScore = Math.min(100, Math.max(0, barScore));
    scorePlot.push({
      time: bars[i].time as number,
      value: barScore,
      color: scoreColor(barScore),
    });
  }

  // Build sub-indicator overlay plots
  const sma20Plot: { time: number; value: number }[] = [];
  const rangeHighPlot: { time: number; value: number }[] = [];
  const rangeLowPlot: { time: number; value: number }[] = [];

  if (trendResult) {
    for (const pt of trendResult.plots.sma20) {
      sma20Plot.push({ time: pt.time as number, value: pt.value });
    }
  }
  if (breakoutResult) {
    for (const pt of breakoutResult.plots.rangeHigh) {
      rangeHighPlot.push({ time: pt.time as number, value: pt.value });
    }
    for (const pt of breakoutResult.plots.rangeLow) {
      rangeLowPlot.push({ time: pt.time as number, value: pt.value });
    }
  }

  return {
    metadata: {
      title: "Turtle Miura Strategy",
      overlay: false,
      plots: [
        { varName: "score", title: "Score", color: "#7e57c2", linewidth: 2, style: "line" },
        { varName: "sma20", title: "SMA 20", color: "#2196f3", linewidth: 1, style: "line" },
        { varName: "rangeHigh", title: "Range High", color: "#26a69a", linewidth: 1, style: "line" },
        { varName: "rangeLow", title: "Range Low", color: "#ef5350", linewidth: 1, style: "line" },
      ],
    },
    plots: {
      score: scorePlot,
      sma20: sma20Plot,
      rangeHigh: rangeHighPlot,
      rangeLow: rangeLowPlot,
    },
    score,
    state,
    components,
    details,
  };
}
