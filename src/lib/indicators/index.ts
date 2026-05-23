// src/lib/indicators/index.ts
// ── lightweight-charts-indicators lazy-loader ──
// The library (~30KB) is loaded on first use via preloadIndicators().
// All public functions remain synchronous — they use the cached module
// reference after preload completes. Call preloadIndicators() early
// (e.g. on component mount) to avoid blocking the first calculation.

import type { Bar } from "oakscriptjs";
import type { Candle } from "@/lib/binance/types";

// ── Dynamic module cache ──
type IndicatorsModule = typeof import("lightweight-charts-indicators");

let _module: IndicatorsModule | null = null;
let _loadPromise: Promise<IndicatorsModule> | null = null;

/** Preload the indicators library. Call on component mount for best UX. */
export function preloadIndicators(): Promise<IndicatorsModule> {
  if (_module) return Promise.resolve(_module);
  if (!_loadPromise) {
    _loadPromise = import("lightweight-charts-indicators").then((m) => {
      _module = m;
      return m;
    });
  }
  return _loadPromise;
}

/** Get the cached module or throw if not yet loaded. */
function getModule(): IndicatorsModule {
  if (!_module) throw new Error("Indicators not loaded — call preloadIndicators() first");
  return _module;
}

export interface IndicatorPoint {
  time: number;
  value: number;
}

export interface MACDPoint {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

export interface BollingerBandsPoint {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

export interface StochasticPoint {
  time: number;
  k: number;
  d: number;
}

/**
 * Convert our Candle[] to Bar[] for lightweight-charts-indicators.
 * The shapes are identical (time, open, high, low, close, volume),
 * but we cast explicitly for type safety.
 */
function toBars(candles: Candle[]): Bar[] {
  return candles as unknown as Bar[];
}

/**
 * Filter NaN values from library plot output.
 * lightweight-charts-indicators outputs NaN for points before
 * the indicator has enough data; lightweight-charts setData
 * does not accept NaN.
 */
function filterNaN(
  points: { time: number; value: number }[],
): IndicatorPoint[] {
  return points.filter((p) => !isNaN(p.value)) as IndicatorPoint[];
}

/**
 * Simple Moving Average — powered by lightweight-charts-indicators.
 */
export function sma(candles: Candle[], period: number): IndicatorPoint[] {
  if (period <= 0 || candles.length < period) return [];
  const m = getModule();
  const result = m.SMA.calculate(toBars(candles), {
    len: period,
    src: "close" as const,
  });
  return filterNaN(result.plots.plot0);
}

/**
 * Exponential Moving Average — powered by lightweight-charts-indicators.
 */
export function ema(candles: Candle[], period: number): IndicatorPoint[] {
  const m = getModule();
  const result = m.EMA.calculate(toBars(candles), {
    length: period,
    src: "close" as const,
  });
  return filterNaN(result.plots.plot0);
}

/**
 * Relative Strength Index — powered by lightweight-charts-indicators.
 * Wilder smoothing matches TradingView's built-in RSI.
 */
export function rsi(candles: Candle[], period = 14): IndicatorPoint[] {
  const m = getModule();
  const result = m.RSI.calculate(toBars(candles), {
    length: period,
    src: "close" as const,
  });
  return filterNaN(result.plots.plot0);
}

/**
 * Average True Range — powered by lightweight-charts-indicators.
 * Measures market volatility. Default smoothing: RMA (Wilder).
 */
export function atr(candles: Candle[], period = 14): IndicatorPoint[] {
  const m = getModule();
  const result = m.ATR.calculate(toBars(candles), {
    length: period,
    smoothing: "RMA" as const,
  });
  return filterNaN(result.plots.plot0);
}

/**
 * MACD — powered by lightweight-charts-indicators.
 * fastLength/slowLength/signalLength default: 12/26/9.
 */
export function macd(
  candles: Candle[],
  fast = 12,
  slow = 26,
  signal = 9,
): MACDPoint[] {
  const m = getModule();
  const result = m.MACD.calculate(toBars(candles), {
    fastLength: fast,
    slowLength: slow,
    signalLength: signal,
    src: "close" as const,
  });

  const macdPoints = result.plots.plot0.filter((p) => !isNaN(p.value));
  const signalPoints = result.plots.plot1.filter((p) => !isNaN(p.value));

  const signalByTime = new Map(signalPoints.map((p) => [p.time, p.value]));

  return macdPoints
    .map((p) => {
      const s = signalByTime.get(p.time);
      if (s === undefined) return null;
      return { time: p.time, macd: p.value, signal: s, histogram: p.value - s };
    })
    .filter(Boolean) as MACDPoint[];
}

/**
 * Bollinger Bands — powered by lightweight-charts-indicators.
 * Returns upper, middle, and lower band data points.
 */
export function bollingerBands(
  candles: Candle[],
  period = 20,
  stdDev = 2,
): BollingerBandsPoint[] {
  const m = getModule();
  const result = m.BollingerBands.calculate(toBars(candles), {
    length: period,
    mult: stdDev,
    src: "close" as const,
  });

  const upper = result.plots.upperBand.filter((p) => !isNaN(p.value));
  const middle = result.plots.middleBand.filter((p) => !isNaN(p.value));
  const lower = result.plots.lowerBand.filter((p) => !isNaN(p.value));

  const middleByTime = new Map(middle.map((p) => [p.time, p.value]));
  const lowerByTime = new Map(lower.map((p) => [p.time, p.value]));

  return upper
    .map((p) => {
      const mid = middleByTime.get(p.time);
      const l = lowerByTime.get(p.time);
      if (mid === undefined || l === undefined) return null;
      return { time: p.time, upper: p.value, middle: mid, lower: l };
    })
    .filter(Boolean) as BollingerBandsPoint[];
}

/**
 * Stochastic Oscillator — powered by lightweight-charts-indicators.
 * Returns %K and %D lines.
 */
export function stochastic(
  candles: Candle[],
  kPeriod = 14,
  dPeriod = 3,
  smooth = 3,
): StochasticPoint[] {
  const m = getModule();
  const result = m.Stochastic.calculate(toBars(candles), {
    periodK: kPeriod,
    periodD: dPeriod,
    smoothK: smooth,
  });

  const kLine = result.plots.plot0.filter((p) => !isNaN(p.value));
  const dLine = result.plots.plot1.filter((p) => !isNaN(p.value));

  const dByTime = new Map(dLine.map((p) => [p.time, p.value]));

  return kLine
    .map((p) => {
      const d = dByTime.get(p.time);
      if (d === undefined) return null;
      return { time: p.time, k: p.value, d };
    })
    .filter(Boolean) as StochasticPoint[];
}

/**
 * Breakout Levels — detects high and low levels of a price consolidation range.
 * Returns the highest high and lowest low of the last `lookback` candles.
 * (Pure JS — no library dependency.)
 */
export function breakoutLevels(
  candles: Candle[],
  lookback = 20,
): { high: number; low: number; highTime: number; lowTime: number } | null {
  if (candles.length < lookback) return null;

  const sorted = [...candles].sort((a, b) => a.time - b.time);
  const recent = sorted.slice(-lookback);

  if (recent.length === 0) return null;

  const high = Math.max(...recent.map((c) => c.high));
  const low = Math.min(...recent.map((c) => c.low));
  const highCandle = recent.find((c) => c.high === high) || recent[recent.length - 1];
  const lowCandle = recent.find((c) => c.low === low) || recent[recent.length - 1];

  return {
    high,
    low,
    highTime: highCandle.time,
    lowTime: lowCandle.time,
  };
}
