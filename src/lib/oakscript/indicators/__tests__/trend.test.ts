import { describe, it, expect } from "vitest";
import { trendIndicator } from "../trend";
import { generateBars } from "./fixtures";

describe("trendIndicator", () => {
	it("returns null when not enough bars", () => {
		const bars = generateBars(10, "up");
		expect(trendIndicator(bars)).toBeNull();
	});

	it("detects uptrend correctly", () => {
		const bars = generateBars(100, "up", 50);
		const result = trendIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.metadata.title).toBe("Trend Detection");
		expect(result.metadata.overlay).toBe(true);
		expect(result.plots.sma20.length).toBeGreaterThan(0);
		expect(result.sma20Value).toBeGreaterThan(0);
	});

	it("detects downtrend as not trending", () => {
		const bars = generateBars(100, "down", 200);
		const result = trendIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		// In a downtrend, should not be trending
		expect(result.isTrending).toBe(false);
	});

	it("returns correct metadata with plots", () => {
		const bars = generateBars(50, "up");
		const result = trendIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.metadata.plots).toHaveLength(2);
		expect(result.metadata.plots![0].varName).toBe("sma20");
		expect(result.metadata.plots![1].varName).toBe("trendState");
	});

	it("sma20 plot has valid time-value pairs", () => {
		const bars = generateBars(50, "up");
		const result = trendIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		for (const point of result.plots.sma20) {
			expect(typeof point.time).toBe("number");
			expect(typeof point.value).toBe("number");
			expect(isNaN(point.value)).toBe(false);
		}
	});
});
