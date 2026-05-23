"use client";

import { useMemo } from "react";
import { ema, sma, rsi, macd, atr, preloadIndicators } from "@/lib/indicators";
import type { Candle } from "@/lib/binance/types";
import type { IndicatorConfig, IndicatorKey } from "@/lib/store/chart-store";

export function useChartIndicators(
  candles: Candle[],
  indicators: Record<IndicatorKey, boolean>,
  config: IndicatorConfig
) {
  return useMemo(() => {
    // If indicators library isn't loaded yet, return empty results.
    // preloadIndicators() is called on PriceChart mount, so this
    // only returns empty during the very first render cycle.
    try {
      return {
        ema20: indicators.ema20 ? ema(candles, config.ema20) : [],
        ema50: indicators.ema50 ? ema(candles, config.ema50) : [],
        ema200: indicators.ema200 ? ema(candles, config.ema200) : [],
        sma20: indicators.sma20 ? sma(candles, config.sma20) : [],
        rsi: indicators.rsi ? rsi(candles, config.rsi) : [],
        macd: indicators.macd ? macd(candles, config.macdFast, config.macdSlow, config.macdSignal) : [],
        atr: indicators.atr ? atr(candles, config.atr) : [],
      };
    } catch {
      // Module not loaded yet — return empty and retry on next render
      preloadIndicators();
      return {
        ema20: [] as ReturnType<typeof ema>,
        ema50: [] as ReturnType<typeof ema>,
        ema200: [] as ReturnType<typeof ema>,
        sma20: [] as ReturnType<typeof sma>,
        rsi: [] as ReturnType<typeof rsi>,
        macd: [] as ReturnType<typeof macd>,
        atr: [] as ReturnType<typeof atr>,
      };
    }
  }, [candles, indicators, config]);
}
