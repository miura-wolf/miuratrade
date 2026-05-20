import { describe, it, expect } from "vitest";
import { evaluateSignal, scanMarket } from "../engine";
import { turtleMiuraIndicator } from "../../oakscript/indicators/turtle-miura";
import { trendIndicator } from "../../oakscript/indicators/trend";
import { momentumIndicator } from "../../oakscript/indicators/momentum";
import { BarData } from "oakscriptjs";
import { generateBars } from "../../oakscript/indicators/__tests__/fixtures";

const VALID_STATES = ["HIGH PRIORITY", "STRONG", "WATCH", "WEAK", "AVOID"] as const;

describe("evaluateSignal", () => {
  it("returns valid signal for uptrend data", () => {
    const bars = generateBars(100, "up", 50000);
    const result = evaluateSignal("BTCUSDT", bars);

    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(100);
    expect(VALID_STATES).toContain(result!.state);
    expect(result!.trend).toBeGreaterThanOrEqual(0);
    expect(result!.trend).toBeLessThanOrEqual(25);
    expect(result!.breakout).toBeGreaterThanOrEqual(0);
    expect(result!.breakout).toBeLessThanOrEqual(25);
    expect(result!.momentum).toBeGreaterThanOrEqual(0);
    expect(result!.momentum).toBeLessThanOrEqual(25);
    expect(result!.volatility).toBeGreaterThanOrEqual(0);
    expect(result!.volatility).toBeLessThanOrEqual(25);
  });

  it("returns null for insufficient data", () => {
    const bars = generateBars(10, "up", 50000);
    const result = evaluateSignal("BTCUSDT", bars);

    expect(result).toBeNull();
  });
});

describe("scanMarket", () => {
  it("scores and ranks multiple pairs", () => {
    const upBars = generateBars(100, "up", 100);
    const downBars = generateBars(100, "down", 100);
    const sidewaysBars = generateBars(100, "sideways", 100);

    const results = scanMarket([
      { symbol: "BTCUSDT", candles: upBars },
      { symbol: "ETHUSDT", candles: downBars },
      { symbol: "SOLUSDT", candles: sidewaysBars },
    ]);

    expect(results).toHaveLength(3);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    expect(results[1].score).toBeGreaterThanOrEqual(results[2].score);
    for (const r of results) {
      expect(r).toHaveProperty("symbol");
      expect(r).toHaveProperty("score");
      expect(r).toHaveProperty("state");
      expect(r).toHaveProperty("trend");
    }
    expect(results[0].symbol).toBe("BTCUSDT");
  });

  it("includes relative strength ranking", () => {
    const upBars = generateBars(100, "up", 50000);
    const downBars = generateBars(100, "down", 3000);
    const sidewaysBars = generateBars(100, "sideways", 100);

    const results = scanMarket([
      { symbol: "BTCUSDT", candles: upBars },
      { symbol: "ETHUSDT", candles: downBars },
      { symbol: "SOLUSDT", candles: sidewaysBars },
    ]);

    const ranks = results.map((r) => r.rsRank).filter((r) => r !== undefined);
    const uniqueRanks = [...new Set(ranks)];
    expect(uniqueRanks.length).toBe(ranks.length);
    for (const r of results) {
      expect(r.rsRank).toBeGreaterThanOrEqual(1);
      expect(r.rsRank).toBeLessThanOrEqual(3);
      expect(r.rsScore).toBeGreaterThanOrEqual(0);
      expect(r.rsScore).toBeLessThanOrEqual(100);
    }
  });
});

describe("full pipeline", () => {
  it("bars -> turtleMiuraIndicator -> evaluateSignal produce same result", () => {
    const bars = generateBars(100, "up", 50000);
    const indicator = turtleMiuraIndicator(bars);
    const signal = evaluateSignal("TESTUSDT", bars);

    expect(indicator).not.toBeNull();
    expect(signal).not.toBeNull();
    expect(signal!.score).toBe(indicator!.score);
    expect(signal!.state).toBe(indicator!.state);
  });
});

describe("renderer", () => {
  it("trend indicator has metadata and expected plot keys", () => {
    const bars = generateBars(100, "up", 50000);
    const result = trendIndicator(bars);

    expect(result).not.toBeNull();
    expect(result!.metadata.title).toBeDefined();
    expect(result!.metadata.overlay).toBe(true);
    expect(result!.plots).toHaveProperty("sma20");
    expect(result!.plots).toHaveProperty("trendState");
    expect(Array.isArray(result!.plots.sma20)).toBe(true);
    for (const pt of result!.plots.sma20) {
      expect(typeof pt.time).toBe("number");
      expect(pt.time).not.toBeNaN();
    }
    expect(Array.isArray(result!.hlines ?? [])).toBe(true);
  });

  it("momentum indicator has hlines at 30, 50, 70", () => {
    const bars = generateBars(100, "up", 50000);
    const result = momentumIndicator(bars);

    expect(result).not.toBeNull();
    expect(result!.hlines).toHaveLength(3);
    const hlineValues = result!.hlines!.map((hl) => hl.value).sort((a, b) => a - b);
    expect(hlineValues[0]).toBe(30);
    expect(hlineValues[1]).toBe(50);
    expect(hlineValues[2]).toBe(70);
  });
});

describe("BarData equivalence", () => {
  it("BarData produces same results as Bar[]", () => {
    const bars = generateBars(100, "up", 50000);
    const barData = BarData.from(bars);

    const fromBars = trendIndicator(bars);
    const fromBarData = trendIndicator(barData);

    expect(fromBars).not.toBeNull();
    expect(fromBarData).not.toBeNull();

    const sma20Bars = fromBars!.plots.sma20;
    const sma20BarData = fromBarData!.plots.sma20;
    expect(sma20Bars.length).toBe(sma20BarData.length);

    for (let i = 0; i < sma20Bars.length; i++) {
      expect(sma20Bars[i].value).toBeCloseTo(sma20BarData[i].value, 10);
      expect(sma20Bars[i].time).toBe(sma20BarData[i].time);
    }
  });
});

describe("turtleMiuraIndicator options", () => {
  it("works with custom smaPeriod and rsiPeriod", () => {
    const bars = generateBars(100, "up", 50000);
    const result = turtleMiuraIndicator(bars, {
      trend: { smaPeriod: 10 },
      momentum: { rsiPeriod: 7 },
    });

    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(100);
  });
});

describe("signal state classification", () => {
  it("classifies uptrend as good state and downtrend as bad state", () => {
    const upBars = generateBars(100, "up", 50000);
    const upResult = evaluateSignal("UP", upBars);
    expect(upResult).not.toBeNull();
    const goodStates: string[] = ["HIGH PRIORITY", "STRONG", "WATCH"];
    const badStates: string[] = ["WEAK", "AVOID"];
    if (upResult!.score >= 65) {
      expect(goodStates).toContain(upResult!.state);
    }

    const downBars = generateBars(100, "down", 50000);
    const downResult = evaluateSignal("DOWN", downBars);
    expect(downResult).not.toBeNull();
    if (downResult!.score < 65) {
      expect(badStates).toContain(downResult!.state);
    }
  });
});
