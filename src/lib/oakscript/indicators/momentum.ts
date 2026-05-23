// Momentum Indicator — implementation using oakscriptjs
import {
  type IndicatorResult,
  type BarData,
  type Bar,
  Series,
  BarData as BarDataClass,
  rsi,
} from "oakscriptjs";

export interface MomentumOptions {
  rsiPeriod?: number;
}

export interface MomentumResult extends IndicatorResult {
  isBullish: boolean;
  rsiValue: number;
}

function toBars(input: BarData | Bar[]): Bar[] {
  if (input instanceof BarDataClass) return input.bars;
  return input;
}

export function momentumIndicator(
  input: BarData | Bar[],
  options?: MomentumOptions,
): MomentumResult | null {
  const bars = toBars(input);
  const rsiPeriod = options?.rsiPeriod ?? 14;

  if (bars.length < rsiPeriod + 1) return null;

  const closeSeries = Series.fromBars(bars, "close");
  const rsiSeries = rsi(closeSeries, rsiPeriod);
  const rsiArr = rsiSeries.toArray();

  const lastIdx = bars.length - 1;
  const rsiValue = rsiArr[lastIdx] ?? 50;
  const isBullish = rsiValue > 50;

  // Build RSI plot
  const rsiPlot: { time: number; value: number; color?: string }[] = [];
  for (let i = 0; i < bars.length; i++) {
    const v = rsiArr[i];
    if (v != null && !isNaN(v)) {
      let color = "#666666";
      if (v > 70) color = "#ef5350";
      else if (v < 30) color = "#26a69a";
      else if (v > 50) color = "#26a69a";
      rsiPlot.push({ time: bars[i].time as number, value: v, color });
    }
  }

  return {
    metadata: {
      title: "Momentum (RSI)",
      overlay: false,
      plots: [
        { varName: "rsi", title: "RSI", color: "#7e57c2", linewidth: 2, style: "line" },
      ],
    },
    plots: {
      rsi: rsiPlot,
    },
    hlines: [
      { value: 50, options: { title: "Mid", color: "#666666", linestyle: "dashed", linewidth: 1 } },
      { value: 30, options: { title: "Oversold", color: "#26a69a", linestyle: "dashed", linewidth: 1 } },
      { value: 70, options: { title: "Overbought", color: "#ef5350", linestyle: "dashed", linewidth: 1 } },
    ],
    isBullish,
    rsiValue,
  };
}
