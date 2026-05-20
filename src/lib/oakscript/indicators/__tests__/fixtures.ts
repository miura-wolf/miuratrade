import type { Bar } from "oakscriptjs";

/**
 * Generate synthetic bar data for testing.
 * Creates `count` bars with a configurable trend.
 *
 * @param count - Number of bars to generate
 * @param trend - 'up' | 'down' | 'sideways'
 * @param startPrice - Starting price
 */
export function generateBars(
	count: number,
	trend: "up" | "down" | "sideways" = "up",
	startPrice = 100,
): Bar[] {
	const bars: Bar[] = [];
	let price = startPrice;
	const baseTime = 1700000000; // fixed timestamp

	for (let i = 0; i < count; i++) {
		const drift =
			trend === "up" ? 0.3 : trend === "down" ? -0.3 : (Math.random() - 0.5) * 0.5;
		const volatility = 1 + Math.random() * 0.5;

		const open = price;
		const close = price + drift * volatility;
		const high = Math.max(open, close) + Math.random() * volatility * 0.5;
		const low = Math.min(open, close) - Math.random() * volatility * 0.5;
		const volume = 1000 + Math.random() * 2000;

		bars.push({
			time: baseTime + i * 3600, // 1h candles
			open: Math.round(open * 100) / 100,
			high: Math.round(high * 100) / 100,
			low: Math.round(low * 100) / 100,
			close: Math.round(close * 100) / 100,
			volume: Math.round(volume),
		});

		price = close;
	}

	return bars;
}

/**
 * Generate bars with a clear breakout pattern:
 * - Sideways consolidation for `consolidationBars`
 * - Sharp breakout with volume expansion for `breakoutBars`
 */
export function generateBreakoutBars(
	consolidationBars = 20,
	breakoutBars = 5,
): Bar[] {
	const bars: Bar[] = [];
	const baseTime = 1700000000;
	let price = 100;

	// Consolidation phase: tight range
	for (let i = 0; i < consolidationBars; i++) {
		const open = price;
		const close = price + (Math.random() - 0.5) * 0.5;
		const high = Math.max(open, close) + Math.random() * 0.3;
		const low = Math.min(open, close) - Math.random() * 0.3;

		bars.push({
			time: baseTime + i * 3600,
			open: Math.round(open * 100) / 100,
			high: Math.round(high * 100) / 100,
			low: Math.round(low * 100) / 100,
			close: Math.round(close * 100) / 100,
			volume: 1000,
		});

		price = close;
	}

	// Breakout phase: strong move up with volume
	for (let i = 0; i < breakoutBars; i++) {
		const open = price;
		const close = price + 2 + i * 0.5;
		const high = close + 0.5;
		const low = open - 0.2;

		bars.push({
			time: baseTime + (consolidationBars + i) * 3600,
			open: Math.round(open * 100) / 100,
			high: Math.round(high * 100) / 100,
			low: Math.round(low * 100) / 100,
			close: Math.round(close * 100) / 100,
			volume: 3000, // 3x average volume
		});

		price = close;
	}

	return bars;
}
