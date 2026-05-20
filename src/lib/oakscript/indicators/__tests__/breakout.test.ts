import { describe, it, expect } from "vitest";
import { breakoutIndicator } from "../breakout";
import { generateBars, generateBreakoutBars } from "./fixtures";

describe("breakoutIndicator", () => {
	it("returns null when not enough bars", () => {
		const bars = generateBars(10, "up");
		expect(breakoutIndicator(bars)).toBeNull();
	});

	it("detects breakout pattern", () => {
		const bars = generateBreakoutBars(20, 5);
		const result = breakoutIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.metadata.title).toBe("Breakout Detection");
		expect(result.metadata.overlay).toBe(true);
		expect(result.plots.rangeHigh.length).toBeGreaterThan(0);
		expect(result.plots.rangeLow.length).toBeGreaterThan(0);
	});

	it("range high is always >= range low", () => {
		const bars = generateBars(50, "sideways");
		const result = breakoutIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		// Current range values
		expect(result.rangeHigh).toBeGreaterThanOrEqual(result.rangeLow);
	});

	it("returns correct metadata with 3 plots", () => {
		const bars = generateBars(50, "up");
		const result = breakoutIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.metadata.plots).toHaveLength(3);
		expect(result.metadata.plots![0].varName).toBe("rangeHigh");
		expect(result.metadata.plots![1].varName).toBe("rangeLow");
		expect(result.metadata.plots![2].varName).toBe("breakoutSignal");
	});
});
