// Trend Indicator — implementation using oakscriptjs
import {
  type IndicatorResult,
  type BarData,
  type Bar,
  Series,
  BarData as BarDataClass,
  sma,
  ta,
} from "oakscriptjs";

export interface TrendOptions {
  smaPeriod?: number;
  lookback?: number;
}

export interface TrendResult extends IndicatorResult {
  isTrending: boolean;
  sma20Value: number;
}

/** Helper to get Bar[] from Bar[] | BarData */
function toBars(input: BarData | Bar[]): Bar[] {
  if (input instanceof BarDataClass) {
    return input.bars;
  }
  return input;
}

export function trendIndicator(
  input: BarData | Bar[],
  options?: TrendOptions,
): TrendResult | null {
  const bars = toBars(input);
  const smaPeriod = options?.smaPeriod ?? 20;
  const lookback = options?.lookback ?? 3;

  if (bars.length < smaPeriod + lookback) return null;

  const closeSeries = Series.fromBars(bars, "close");
  const smaSeries = sma(closeSeries, smaPeriod);
  const risingSeries = ta.rising(closeSeries, lookback);
  const fallingSeries = ta.falling(closeSeries, lookback);

  const smaArr = smaSeries.toArray();
  const risingArr = risingSeries.toArray();
  const fallingArr = fallingSeries.toArray();
  const lastIdx = bars.length - 1;

  const sma20Value = smaArr[lastIdx] ?? 0;
  const isRising = (risingArr[lastIdx] ?? 0) === 1;
  const isFalling = (fallingArr[lastIdx] ?? 0) === 1;
  const isTrending = isRising && !isFalling;

  // Build sma20 plot
  const sma20Plot: { time: number; value: number }[] = [];
  for (let i = 0; i < bars.length; i++) {
    const v = smaArr[i];
    if (v != null && !isNaN(v)) {
      sma20Plot.push({ time: bars[i].time as number, value: v });
    }
  }

  // Build trendState plot (1 = trending up, -1 = trending down, 0 = not trending)
  const trendStatePlot: { time: number; value: number; color?: string }[] = [];
  for (let i = 0; i < bars.length; i++) {
    const r = (risingArr[i] ?? 0) === 1;
    const f = (fallingArr[i] ?? 0) === 1;
    let val = 0;
    let color = "#666666";
    if (r && !f) {
      val = 1;
      color = "#26a69a";
    } else if (f && !r) {
      val = -1;
      color = "#ef5350";
    }
    trendStatePlot.push({ time: bars[i].time as number, value: val, color });
  }

  return {
    metadata: {
      title: "Trend Detection",
      overlay: true,
      plots: [
        { varName: "sma20", title: "SMA 20", color: "#2196f3", linewidth: 2, style: "line" },
        { varName: "trendState", title: "Trend State", color: "#666666", linewidth: 2, style: "histogram" },
      ],
    },
    plots: {
      sma20: sma20Plot,
      trendState: trendStatePlot,
    },
    isTrending,
    sma20Value,
  };
}
