Si"use client";

import { useEffect, useRef } from "react";
import { getBinanceWS } from "@/lib/binance/ws";
import type { Timeframe } from "@/lib/binance/types";
import type { Candle } from "@/lib/binance/types";

export function useChartWS(
  symbol: string,
  timeframe: Timeframe,
  onCandle: (c: Candle) => void,
  onTick: (tick: { symbol: string; close: number; open: number; pct: number }) => void
) {
  useEffect(() => {
    const ws = getBinanceWS();

    const unsubKline = ws.subscribeKline({
      symbol,
      interval: timeframe,
      onCandle,
    });

    const unsubTicker = ws.subscribeMiniTickers([symbol], onTick);

    return () => {
      unsubKline();
      unsubTicker();
    };
  }, [symbol, timeframe, onCandle, onTick]);
}
