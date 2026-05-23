// Relative Strength — implementation using oakscriptjs
import {
  type IndicatorResult,
  type BarData,
  type Bar,
  Series,
  BarData as BarDataClass,
  sma,
  rsi,
  atr,
} from "oakscriptjs";

export interface RelativeStrengthOptions {}

export interface RelativeStrengthResult extends IndicatorResult {
  symbol: string;
  rsScore: number;
  components: {
    momentum: number;
    trendQuality: number;
    volumeParticipation: number;
    volatilityHealth: number;
  };
  details: {
    rsi: number;
    volumeVsAvg: number;
    atrVsAvg: number;
  };
}

function toBars(input: BarData | Bar[]): Bar[] {
  if (input instanceof BarDataClass) return input.bars;
  return input;
}

export function relativeStrength(
  symbol: string,
  input: BarData | Bar[],
  _options?: RelativeStrengthOptions,
): RelativeStrengthResult | null {
  const bars = toBars(input);
  if (bars.length < 30) return null;

  const closeSeries = Series.fromBars(bars, "close");
  const volumeSeries = Series.fromBars(bars, "volume");

  const rsiSeries = rsi(closeSeries, 14);
  const atrSeries = atr(bars, 14);
  const atrSmaSeries = sma(atrSeries, 14);
  const volSmaSeries = sma(volumeSeries, 20);

  const rsiArr = rsiSeries.toArray();
  const atrArr = atrSeries.toArray();
  const atrSmaArr = atrSmaSeries.toArray();
  const volArr = volumeSeries.toArray();
  const volSmaArr = volSmaSeries.toArray();
  const closeArr = closeSeries.toArray();

  const lastIdx = bars.length - 1;
  const rsiVal = rsiArr[lastIdx] ?? 50;
  const atrVal = atrArr[lastIdx] ?? 0;
  const atrSmaVal = atrSmaArr[lastIdx] ?? atrVal;
  const volVal = volArr[lastIdx] ?? 0;
  const volSmaVal = volSmaArr[lastIdx] ?? volVal;

  const atrVsAvg = atrSmaVal !== 0 ? atrVal / atrSmaVal : 1;
  const volumeVsAvg = volSmaVal !== 0 ? volVal / volSmaVal : 1;

  // Score components (0-25 each, total 0-100)
  let momentum = 0;
  if (rsiVal > 60) momentum = 25;
  else if (rsiVal > 50) momentum = 20;
  else if (rsiVal > 40) momentum = 12;
  else if (rsiVal > 30) momentum = 6;
  else momentum = 0;

  // Trend quality: price vs SMA20
  const sma20Series = sma(closeSeries, 20);
  const sma20Arr = sma20Series.toArray();
  const sma20Val = sma20Arr[lastIdx] ?? 0;
  const lastClose = closeArr[lastIdx] ?? 0;
  let trendQuality = 0;
  if (lastClose > sma20Val * 1.02) trendQuality = 25;
  else if (lastClose > sma20Val) trendQuality = 20;
  else if (lastClose > sma20Val * 0.98) trendQuality = 12;
  else trendQuality = 3;

  let volumeParticipation = 0;
  if (volumeVsAvg > 1.5) volumeParticipation = 25;
  else if (volumeVsAvg > 1.2) volumeParticipation = 20;
  else if (volumeVsAvg > 0.8) volumeParticipation = 12;
  else volumeParticipation = 3;

  // Volatility health: ATR vs average
  let volatilityHealth = 0;
  if (atrVsAvg >= 0.8 && atrVsAvg <= 1.5) volatilityHealth = 25;
  else if (atrVsAvg >= 0.5 && atrVsAvg <= 2.0) volatilityHealth = 18;
  else if (atrVsAvg > 0) volatilityHealth = 8;

  const rsScore = Math.min(100, momentum + trendQuality + volumeParticipation + volatilityHealth);

  // Build RS plot
  const rsPlot: { time: number; value: number; color?: string }[] = [];
  for (let i = 0; i < bars.length; i++) {
    const r = rsiArr[i] ?? 50;
    const s20 = sma20Arr[i] ?? 0;
    const c = closeArr[i] ?? 0;
    const v = volArr[i] ?? 0;
    const vs = volSmaArr[i] ?? v;
    const vRatio = vs !== 0 ? v / vs : 1;

    let m = 0;
    if (r > 60) m = 25; else if (r > 50) m = 20; else if (r > 40) m = 12; else if (r > 30) m = 6;
    let t = 0;
    if (s20 > 0) {
      if (c > s20 * 1.02) t = 25; else if (c > s20) t = 20; else if (c > s20 * 0.98) t = 12; else t = 3;
    }
    let vp = 0;
    if (vRatio > 1.5) vp = 25; else if (vRatio > 1.2) vp = 20; else if (vRatio > 0.8) vp = 12; else vp = 3;

    const a = atrArr[i] ?? 0;
    const as = atrSmaArr[i] ?? a;
    const aRatio = as !== 0 ? a / as : 1;
    let vh = 0;
    if (aRatio >= 0.8 && aRatio <= 1.5) vh = 25; else if (aRatio >= 0.5 && aRatio <= 2.0) vh = 18; else if (a > 0) vh = 8;

    const normalizedS = Math.min(100, m + t + vp + vh);
    let color = "#666666";
    if (normalizedS >= 70) color = "#26a69a";
    else if (normalizedS >= 40) color = "#ff9800";
    else color = "#ef5350";

    rsPlot.push({ time: bars[i].time as number, value: normalizedS, color });
  }

  return {
    metadata: {
      title: "Relative Strength",
      overlay: false,
      plots: [
        { varName: "rsScore", title: "RS Score", color: "#7e57c2", linewidth: 2, style: "line" },
      ],
    },
    plots: {
      rsScore: rsPlot,
    },
    symbol,
    rsScore,
    components: {
      momentum,
      trendQuality,
      volumeParticipation,
      volatilityHealth,
    },
    details: {
      rsi: rsiVal,
      volumeVsAvg,
      atrVsAvg,
    },
  };
}

export function rankByRelativeStrength(
  pairs: { symbol: string; bars: BarData | Bar[] }[],
  options?: RelativeStrengthOptions,
): RelativeStrengthResult[] {
  const results = pairs
    .map((p) => relativeStrength(p.symbol, p.bars, options))
    .filter((r): r is RelativeStrengthResult => r !== null);

  results.sort((a, b) => b.rsScore - a.rsScore);
  return results;
}
