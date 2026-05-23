"use client";

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
  const onCandleRef = useRef(onCandle);
  onCandleRef.current = onCandle;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    const ws = getBinanceWS();

    const unsubKline = ws.subscribeKline(
      symbol,
      timeframe,
      (c) => onCandleRef.current(c),
    );

    const unsubTicker = ws.subscribeMiniTickers(
      [symbol],
      (t) => onTickRef.current(t),
    );

    return () => {
      unsubKline();
      unsubTicker();
    };
  }, [symbol, timeframe]);
}
