import {
	SMA as LibSMA,
	EMA as LibEMA,
	RSI as LibRSI,
	MACD as LibMACD,
	ATR as LibATR,
} from "lightweight-charts-indicators";
import type { Bar } from "oakscriptjs";
import type { Candle } from "@/lib/binance/types";

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
	const result = LibSMA.calculate(toBars(candles), {
		len: period,
		src: "close",
	});
	return filterNaN(result.plots.plot0);
}

/**
 * Exponential Moving Average — powered by lightweight-charts-indicators.
 */
export function ema(candles: Candle[], period: number): IndicatorPoint[] {
	if (candles.length < period) return [];
	const result = LibEMA.calculate(toBars(candles), {
		length: period,
		src: "close",
	});
	return filterNaN(result.plots.plot0);
}

/**
 * Relative Strength Index — powered by lightweight-charts-indicators.
 * Wilder smoothing matches TradingView's built-in RSI.
 */
export function rsi(candles: Candle[], period = 14): IndicatorPoint[] {
	if (candles.length <= period) return [];
	const result = LibRSI.calculate(toBars(candles), {
		length: period,
		src: "close",
	});
	return filterNaN(result.plots.plot0);
}

/**
 * Average True Range — powered by lightweight-charts-indicators.
 * Measures market volatility. Default smoothing: RMA (Wilder).
 * ATR is used in Sprint 4 for Turtle_Miura volatility filter.
 */
export function atr(candles: Candle[], period = 14): IndicatorPoint[] {
	if (period <= 0 || candles.length < period) return [];
	const result = LibATR.calculate(toBars(candles), {
		length: period,
		smoothing: "RMA",
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
	if (candles.length < slow + signal) return [];
	const result = LibMACD.calculate(toBars(candles), {
		fastLength: fast,
		slowLength: slow,
		signalLength: signal,
		src: "close",
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
 * Breakout Levels — detects high and low levels of a price consolidation range.
 * Returns the highest high and lowest low of the last `lookback` candles.
 */
export function breakoutLevels(
	candles: Candle[],
 lookback = 20
): { high: number; low: number; highTime: number; lowTime: number } | null {
	if (candles.length < lookback) return null;

	const relevantCandles = candles.slice(-lookback);
	if (relevantCandles.length === 0) return null;

	let high = -Infinity;
	let low = Infinity;
	let highTime = 0;
	let lowTime = 0;

	for (const candle of relevantCandles) {
		if (candle.high > high) {
			high = candle.high;
			highTime = candle.time;
		}
		if (candle.low < low) {
			low = candle.low;
			lowTime = candle.time;
		}
	}

	return { high, low, highTime, lowTime };
}
