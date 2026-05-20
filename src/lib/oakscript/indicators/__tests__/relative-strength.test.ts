import { describe, it, expect } from "vitest";
import { BarData } from "oakscriptjs";
import { relativeStrength, rankByRelativeStrength } from "../relative-strength";
import { generateBars } from "./fixtures";

describe("relativeStrength", () => {
  it("returns null when not enough bars", () => {
    const bars = generateBars(10, "up");
    expect(relativeStrength("BTCUSDT", bars)).toBeNull();
  });

  it("calculates RS score between 0 and 100", () => {
    const bars = generateBars(100, "up");
    const result = relativeStrength("BTCUSDT", bars);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.rsScore).toBeGreaterThanOrEqual(0);
    expect(result.rsScore).toBeLessThanOrEqual(100);
  });

  it("has all 4 components", () => {
    const bars = generateBars(100, "up");
    const result = relativeStrength("BTCUSDT", bars);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.components).toHaveProperty("momentum");
    expect(result.components).toHaveProperty("trendQuality");
    expect(result.components).toHaveProperty("volumeParticipation");
    expect(result.components).toHaveProperty("volatilityHealth");
  });

  it("has detail values", () => {
    const bars = generateBars(100, "up");
    const result = relativeStrength("BTCUSDT", bars);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.details.rsi).toBeGreaterThanOrEqual(0);
    expect(result.details.rsi).toBeLessThanOrEqual(100);
    expect(result.details.volumeVsAvg).toBeGreaterThan(0);
    expect(result.details.atrVsAvg).toBeGreaterThan(0);
  });

  it("returns IndicatorResult with metadata and plots", () => {
    const bars = generateBars(100, "up");
    const result = relativeStrength("BTCUSDT", bars);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.metadata).toBeDefined();
    expect(result.metadata.title).toBe("Relative Strength");
    expect(result.metadata.overlay).toBe(false);
    expect(result.plots).toBeDefined();
    expect(typeof result.plots).toBe("object");
  });

  it("works with BarData input", () => {
    const bars = generateBars(100, "up");
    const barData = new BarData(bars);
    const result = relativeStrength("BTCUSDT", barData);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.rsScore).toBeGreaterThanOrEqual(0);
    expect(result.rsScore).toBeLessThanOrEqual(100);
    expect(result.metadata).toBeDefined();
    expect(result.plots).toBeDefined();
  });

  it("BarData and Bar[] inputs produce the same result", () => {
    const bars = generateBars(100, "up");
    const barData = new BarData(bars);
    const fromBars = relativeStrength("BTCUSDT", bars);
    const fromBarData = relativeStrength("BTCUSDT", barData);
    expect(fromBars).not.toBeNull();
    expect(fromBarData).not.toBeNull();
    if (!fromBars || !fromBarData) return;
    expect(fromBarData.rsScore).toBe(fromBars.rsScore);
    expect(fromBarData.components).toEqual(fromBars.components);
    expect(fromBarData.details).toEqual(fromBars.details);
  });

  it("ranks multiple pairs by RS descending", () => {
    const pairs = [
      { symbol: "BTCUSDT", bars: generateBars(100, "up", 100) },
      { symbol: "ETHUSDT", bars: generateBars(100, "down", 200) },
      { symbol: "SOLUSDT", bars: generateBars(100, "up", 50) },
    ];
    const ranked = rankByRelativeStrength(pairs);
    expect(ranked).toHaveLength(3);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].rsScore).toBeGreaterThanOrEqual(ranked[i].rsScore);
    }
  });

  it("rankByRelativeStrength works with BarData inputs", () => {
    const pairs = [
      { symbol: "BTCUSDT", bars: new BarData(generateBars(100, "up", 100)) },
      { symbol: "ETHUSDT", bars: new BarData(generateBars(100, "down", 200)) },
    ];
    const ranked = rankByRelativeStrength(pairs);
    expect(ranked).toHaveLength(2);
    for (const r of ranked) {
      expect(r.metadata).toBeDefined();
      expect(r.plots).toBeDefined();
    }
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].rsScore).toBeGreaterThanOrEqual(ranked[i].rsScore);
    }
  });
});
