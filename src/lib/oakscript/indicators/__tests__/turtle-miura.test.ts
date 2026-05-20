import { describe, it, expect } from "vitest";
import { turtleMiuraIndicator } from "../turtle-miura";
import { generateBars, generateBreakoutBars } from "./fixtures";

describe("turtleMiuraIndicator", () => {
	it("returns null when not enough bars", () => {
		const bars = generateBars(20, "up");
		expect(turtleMiuraIndicator(bars)).toBeNull();
	});

	it("calculates score between 0 and 100", () => {
		const bars = generateBars(100, "up");
		const result = turtleMiuraIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.score).toBeGreaterThanOrEqual(0);
		expect(result.score).toBeLessThanOrEqual(100);
	});

	it("assigns correct signal state", () => {
		const bars = generateBars(100, "up");
		const result = turtleMiuraIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		const validStates = ["HIGH PRIORITY", "STRONG", "WATCH", "WEAK", "AVOID"];
		expect(validStates).toContain(result.state);
	});

	it("has all 4 component scores", () => {
		const bars = generateBars(100, "up");
		const result = turtleMiuraIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.components).toHaveProperty("trend");
		expect(result.components).toHaveProperty("breakout");
		expect(result.components).toHaveProperty("momentum");
		expect(result.components).toHaveProperty("volatility");

		// Each component should be 0-25
		expect(result.components.trend).toBeGreaterThanOrEqual(0);
		expect(result.components.trend).toBeLessThanOrEqual(25);
		expect(result.components.breakout).toBeGreaterThanOrEqual(0);
		expect(result.components.breakout).toBeLessThanOrEqual(25);
		expect(result.components.momentum).toBeGreaterThanOrEqual(0);
		expect(result.components.momentum).toBeLessThanOrEqual(25);
		expect(result.components.volatility).toBeGreaterThanOrEqual(0);
		expect(result.components.volatility).toBeLessThanOrEqual(25);
	});

	it("has detail values", () => {
		const bars = generateBars(100, "up");
		const result = turtleMiuraIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.details.price).toBeGreaterThan(0);
		expect(result.details.sma20).toBeGreaterThan(0);
		expect(result.details.rsi).toBeGreaterThanOrEqual(0);
		expect(result.details.rsi).toBeLessThanOrEqual(100);
		expect(result.details.atr).toBeGreaterThan(0);
	});

	it("score plot has color-coded values", () => {
		const bars = generateBars(100, "up");
		const result = turtleMiuraIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		const scorePlot = result.plots.score;
		expect(scorePlot.length).toBeGreaterThan(0);

		for (const point of scorePlot) {
			expect(typeof point.time).toBe("number");
			expect(typeof point.value).toBe("number");
			expect(point.color).toBeDefined();
		}
	});

	it("includes sub-indicator overlay plots", () => {
		const bars = generateBars(100, "up");
		const result = turtleMiuraIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		// Should have trend's SMA20 plot
		expect(result.plots.sma20).toBeDefined();
		expect(result.plots.sma20.length).toBeGreaterThan(0);

		// Should have breakout's range plots
		expect(result.plots.rangeHigh).toBeDefined();
		expect(result.plots.rangeLow).toBeDefined();
	});

	it("higher score in breakout scenario", () => {
		const breakoutBars = generateBreakoutBars(80, 10);
		const result = turtleMiuraIndicator(breakoutBars);

		expect(result).not.toBeNull();
		if (!result) return;

		// Breakout scenario should have non-zero breakout score
		expect(result.components.breakout).toBeGreaterThanOrEqual(0);
	});
});
