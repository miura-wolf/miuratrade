// Volatility Indicator — implementation using oakscriptjs
import {
  type IndicatorResult,
  type BarData,
  type Bar,
  Series,
  BarData as BarDataClass,
  sma,
  atr,
} from "oakscriptjs";

export interface VolatilityOptions {
  atrPeriod?: number;
  thresholdMult?: number;
}

export interface VolatilityResult extends IndicatorResult {
  isHealthy: boolean;
  atrValue: number;
  atrVsAverage: number;
}

function toBars(input: BarData | Bar[]): Bar[] {
  if (input instanceof BarDataClass) return input.bars;
  return input;
}

export function volatilityIndicator(
  input: BarData | Bar[],
  options?: VolatilityOptions,
): VolatilityResult | null {
  const bars = toBars(input);
  const atrPeriod = options?.atrPeriod ?? 14;
  const thresholdMult = options?.thresholdMult ?? 1.0;

  if (bars.length < atrPeriod + 1) return null;

  const closeSeries = Series.fromBars(bars, "close");
  const atrSeries = atr(bars, atrPeriod);
  const atrArr = atrSeries.toArray();

  const lastIdx = bars.length - 1;
  const atrValue = atrArr[lastIdx] ?? 0;

  // ATR SMA for comparison
  const atrSmaSeries = sma(atrSeries, atrPeriod);
  const atrSmaArr = atrSmaSeries.toArray();
  const atrSmaValue = atrSmaArr[lastIdx] ?? atrValue;

  const atrVsAverage = atrSmaValue !== 0 ? atrValue / atrSmaValue : 1;
  const isHealthy = atrVsAverage >= thresholdMult;

  // Build plots
  const atrPlot: { time: number; value: number; color?: string }[] = [];
  const atrSmaPlot: { time: number; value: number }[] = [];
  const volatilityStatePlot: { time: number; value: number; color?: string }[] = [];

  for (let i = 0; i < bars.length; i++) {
    const a = atrArr[i];
    const s = atrSmaArr[i];
    if (a != null && !isNaN(a)) {
      const ratio = s != null && !isNaN(s) && s !== 0 ? a / s : 1;
      let color = "#666666";
      if (ratio >= thresholdMult) color = "#26a69a";
      else color = "#ef5350";
      atrPlot.push({ time: bars[i].time as number, value: a, color });
    }
    if (s != null && !isNaN(s)) {
      atrSmaPlot.push({ time: bars[i].time as number, value: s });
    }
    // Volatility state: 1 = healthy (expanding), -1 = contracting
    const ratio = s != null && !isNaN(s) && s !== 0 ? (a ?? 0) / s : 1;
    const state = ratio >= thresholdMult ? 1 : -1;
    const stateColor = state === 1 ? "#26a69a" : "#ef5350";
    volatilityStatePlot.push({ time: bars[i].time as number, value: state, color: stateColor });
  }

  return {
    metadata: {
      title: "Volatility (ATR)",
      overlay: false,
      plots: [
        { varName: "atr", title: "ATR", color: "#ff9800", linewidth: 2, style: "line" },
        { varName: "atrSMA", title: "ATR SMA", color: "#2196f3", linewidth: 1, style: "line" },
        { varName: "volatilityState", title: "Volatility State", color: "#666666", linewidth: 2, style: "histogram" },
      ],
    },
    plots: {
      atr: atrPlot,
      atrSMA: atrSmaPlot,
      volatilityState: volatilityStatePlot,
    },
    isHealthy,
    atrValue,
    atrVsAverage,
  };
}
