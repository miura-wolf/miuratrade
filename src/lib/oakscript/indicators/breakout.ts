// Breakout Indicator — implementation using oakscriptjs
import {
  type IndicatorResult,
  type BarData,
  type Bar,
  Series,
  BarData as BarDataClass,
  ta,
} from "oakscriptjs";

export interface BreakoutOptions {
  rangePeriod?: number;
  volumeMult?: number;
}

export interface BreakoutResult extends IndicatorResult {
  isBreakout: boolean;
  volumeExpanded: boolean;
  rangeHigh: number;
  rangeLow: number;
}

function toBars(input: BarData | Bar[]): Bar[] {
  if (input instanceof BarDataClass) return input.bars;
  return input;
}

export function breakoutIndicator(
  input: BarData | Bar[],
  options?: BreakoutOptions,
): BreakoutResult | null {
  const bars = toBars(input);
  const rangePeriod = options?.rangePeriod ?? 20;
  const volumeMult = options?.volumeMult ?? 1.5;

  if (bars.length < rangePeriod + 1) return null;

  const highSeries = Series.fromBars(bars, "high");
  const lowSeries = Series.fromBars(bars, "low");
  const closeSeries = Series.fromBars(bars, "close");
  const volumeSeries = Series.fromBars(bars, "volume");

  const highestSeries = ta.highest(highSeries, rangePeriod);
  const lowestSeries = ta.lowest(lowSeries, rangePeriod);

  const highestArr = highestSeries.toArray();
  const lowestArr = lowestSeries.toArray();
  const closeArr = closeSeries.toArray();
  const volumeArr = volumeSeries.toArray();

  const lastIdx = bars.length - 1;
  const prevIdx = lastIdx - 1;

  // Current range values
  const rangeHigh = highestArr[lastIdx] ?? 0;
  const rangeLow = lowestArr[lastIdx] ?? 0;

  // Breakout detection: close breaks above previous highest or below previous lowest
  const prevHigh = highestArr[prevIdx] ?? Infinity;
  const prevLow = lowestArr[prevIdx] ?? -Infinity;
  const lastClose = closeArr[lastIdx] ?? 0;
  const isBreakout = lastClose > prevHigh || lastClose < prevLow;

  // Volume expansion: current volume > volumeMult * average of last rangePeriod bars
  let avgVol = 0;
  const start = Math.max(0, lastIdx - rangePeriod + 1);
  for (let i = start; i <= lastIdx; i++) {
    avgVol += volumeArr[i] ?? 0;
  }
  avgVol /= (lastIdx - start + 1);
  const volumeExpanded = (volumeArr[lastIdx] ?? 0) > avgVol * volumeMult;

  // Build rangeHigh plot
  const rangeHighPlot: { time: number; value: number }[] = [];
  const rangeLowPlot: { time: number; value: number }[] = [];
  const breakoutSignalPlot: { time: number; value: number; color?: string }[] = [];

  for (let i = 0; i < bars.length; i++) {
    const h = highestArr[i];
    const l = lowestArr[i];
    if (h != null && !isNaN(h)) {
      rangeHighPlot.push({ time: bars[i].time as number, value: h });
    }
    if (l != null && !isNaN(l)) {
      rangeLowPlot.push({ time: bars[i].time as number, value: l });
    }
    // Breakout signal: 1 for upside, -1 for downside, 0 for none
    const c = closeArr[i] ?? 0;
    const prevH = i > 0 ? (highestArr[i - 1] ?? Infinity) : Infinity;
    const prevL = i > 0 ? (lowestArr[i - 1] ?? -Infinity) : -Infinity;
    let sig = 0;
    let color = "#666666";
    if (c > prevH) { sig = 1; color = "#26a69a"; }
    else if (c < prevL) { sig = -1; color = "#ef5350"; }
    breakoutSignalPlot.push({ time: bars[i].time as number, value: sig, color });
  }

  return {
    metadata: {
      title: "Breakout Detection",
      overlay: true,
      plots: [
        { varName: "rangeHigh", title: "Range High", color: "#26a69a", linewidth: 1, style: "line" },
        { varName: "rangeLow", title: "Range Low", color: "#ef5350", linewidth: 1, style: "line" },
        { varName: "breakoutSignal", title: "Breakout Signal", color: "#ff9800", linewidth: 2, style: "histogram" },
      ],
    },
    plots: {
      rangeHigh: rangeHighPlot,
      rangeLow: rangeLowPlot,
      breakoutSignal: breakoutSignalPlot,
    },
    isBreakout,
    volumeExpanded,
    rangeHigh,
    rangeLow,
  };
}
