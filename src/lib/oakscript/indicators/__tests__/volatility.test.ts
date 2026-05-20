import { describe, it, expect } from "vitest";
import { volatilityIndicator } from "../volatility";
import { generateBars } from "./fixtures";

describe("volatilityIndicator", () => {
	it("returns null when not enough bars", () => {
		const bars = generateBars(10, "up");
		expect(volatilityIndicator(bars)).toBeNull();
	});

	it("calculates ATR correctly", () => {
		const bars = generateBars(100, "up");
		const result = volatilityIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.atrValue).toBeGreaterThan(0);
	});

	it("atrVsAverage is a positive ratio", () => {
		const bars = generateBars(100, "up");
		const result = volatilityIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.atrVsAverage).toBeGreaterThan(0);
	});

	it("returns correct metadata with 3 plots", () => {
		const bars = generateBars(50, "up");
		const result = volatilityIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.metadata.plots).toHaveLength(3);
		expect(result.metadata.plots![0].varName).toBe("atr");
		expect(result.metadata.plots![1].varName).toBe("atrSMA");
		expect(result.metadata.plots![2].varName).toBe("volatilityState");
	});

	it("metadata shows overlay: false (separate pane)", () => {
		const bars = generateBars(50, "up");
		const result = volatilityIndicator(bars);

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.metadata.overlay).toBe(false);
	});
});
