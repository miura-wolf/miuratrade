"use client";

import { useMemo } from "react";
import { ema, sma, rsi, macd, atr } from "@/lib/indicators";
import type { Candle } from "@/lib/binance/types";
import type { IndicatorConfig, IndicatorKey } from "@/lib/store/chart-store";

export function useChartIndicators(
  candles: Candle[],
  indicators: Record<IndicatorKey, boolean>,
  config: IndicatorConfig
) {
  return useMemo(() => {
    return {
      ema20: indicators.ema20 ? ema(candles, config.ema20) : [],
      ema50: indicators.ema50 ? ema(candles, config.ema50) : [],
      ema200: indicators.ema200 ? ema(candles, config.ema200) : [],
      sma20: indicators.sma20 ? sma(candles, config.sma20) : [],
      rsi: indicators.rsi ? rsi(candles, config.rsi) : [],
      macd: indicators.macd ? macd(candles, config.macdFast, config.macdSlow, config.macdSignal) : [],
      atr: indicators.atr ? atr(candles, config.atr) : [],
    };
  }, [candles, indicators, config]);
}
