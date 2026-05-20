// OakScriptJS Renderer — public stub
// Full renderer available in private fork
import type { IChartApi, ISeriesApi, IPriceLine } from "lightweight-charts";
import type { IndicatorResult } from "oakscriptjs";

export interface RenderedSeries {
  key: string;
  series: ISeriesApi<"Line" | "Histogram">;
  varName: string;
  isHistogram: boolean;
}

export interface RenderedHLine {
  key: string;
  seriesRef: ISeriesApi<"Line" | "Histogram">;
  priceLine: IPriceLine;
}

export interface RenderedIndicator {
  plotSeries: RenderedSeries[];
  hlines: RenderedHLine[];
}

export function renderIndicatorResult(
  _chart: IChartApi,
  _result: IndicatorResult,
  _paneIndex: number,
): RenderedIndicator {
  return { plotSeries: [], hlines: [] };
}

export function removeRenderedIndicator(
  _chart: IChartApi,
  _rendered: RenderedIndicator,
): void {}

export function updateRenderedSeries(
  _rendered: RenderedIndicator,
  _result: IndicatorResult,
): void {}

export function updateLastRenderedBar(
  _rendered: RenderedIndicator,
  _result: IndicatorResult,
): void {}
