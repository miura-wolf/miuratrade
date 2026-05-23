"use client";

import { useEffect, useState, useRef } from "react";
import { fetchKlines } from "@/lib/binance/rest";
import type { Candle, Timeframe } from "@/lib/binance/types";

export function useChartData(symbol: string, timeframe: Timeframe) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const candlesRef = useRef<Candle[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchKlines(symbol, timeframe, 500)
      .then((data) => {
        candlesRef.current = data;
        setCandles(data);
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.error("[ChartData] Failed to fetch:", e);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [symbol, timeframe]);

  return { candles, loading, candlesRef };
}
