import { describe, it, expect } from "vitest";
import { momentumIndicator } from "../momentum";
import { generateBars } from "./fixtures";

describe("momentumIndicator", () => {
	it("returns null when not enough bars", () => {
		const bars = generateBars(10, "up");
		expect(momentumIndicator(bars)).toBeNull();
	});

	it("calculates RSI correctly", () => {
		const bars = generateBars(100, "up");
		const result = momentumIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		// RSI should be between 0 and 100
		expect(result.rsiValue).toBeGreaterThanOrEqual(0);
		expect(result.rsiValue).toBeLessThanOrEqual(100);
	});

	it("detects bullish momentum in uptrend", () => {
		const bars = generateBars(100, "up", 50);
		const result = momentumIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		// In a strong uptrend, RSI should be bullish
		expect(result.rsiValue).toBeGreaterThan(50);
	});

	it("returns hlines for RSI reference levels", () => {
		const bars = generateBars(50, "up");
		const result = momentumIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.hlines).toBeDefined();
		expect(result.hlines).toHaveLength(3);
		expect(result.hlines![0].value).toBe(50);
		expect(result.hlines![1].value).toBe(30);
		expect(result.hlines![2].value).toBe(70);
	});

	it("metadata shows overlay: false (separate pane)", () => {
		const bars = generateBars(50, "up");
		const result = momentumIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.metadata.overlay).toBe(false);
	});
});
