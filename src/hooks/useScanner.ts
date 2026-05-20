"use client";

import { useCallback, useEffect, useRef } from "react";
import { useScannerStore } from "@/lib/store/scanner-store";
import { fetchAllUSDTTickers } from "@/lib/binance/ticker";
import { fetchKlines } from "@/lib/binance/rest";
import { evaluateSignal, type SignalResult } from "@/lib/signal/engine";

/**
 * Hook that manages the market scanner lifecycle:
 * 1. Fetches all USDT pairs on mount
 * 2. Runs signal engine on selected pairs
 * 3. Provides manual scan trigger
 * 4. Supports configurable auto-scan interval
 */
export function useScanner() {
  const {
    allPairs,
    selectedSymbols,
    scanResults,
    isScanning,
    lastScanAt,
    autoScanEnabled,
    autoScanInterval,
    setAllPairs,
    setIsScanning,
    setScanResults,
  } = useScannerStore();

  const hasFetched = useRef(false);

  // Fetch all pairs on mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchAllUSDTTickers()
      .then(setAllPairs)
      .catch((e) => console.error("[Scanner] Failed to fetch tickers:", e));
  }, [setAllPairs]);

  // Run scan on selected pairs
  const runScan = useCallback(async () => {
    if (selectedSymbols.length === 0 || isScanning) return;

    setIsScanning(true);
    console.log(
      `[Scanner] Scanning ${selectedSymbols.length} pairs...`,
    );

    try {
      // Fetch candles for each selected pair (1h timeframe, 100 candles)
      const results: SignalResult[] = [];
      const batchSize = 10; // avoid overwhelming Binance API

      for (let i = 0; i < selectedSymbols.length; i += batchSize) {
        const batch = selectedSymbols.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (symbol) => {
            try {
              const candles = await fetchKlines(symbol, "1h", 100);
              return evaluateSignal(symbol, candles);
            } catch {
              return null;
            }
          }),
        );
        for (const r of batchResults) {
          if (r) results.push(r);
        }
      }

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);
      setScanResults(results);
      console.log(`[Scanner] Scan complete: ${results.length} pairs evaluated`);
    } catch (e) {
      console.error("[Scanner] Scan failed:", e);
    } finally {
      setIsScanning(false);
    }
  }, [selectedSymbols, isScanning, setIsScanning, setScanResults]);

  // Auto-scan interval
  useEffect(() => {
    if (!autoScanEnabled || autoScanInterval <= 0) return;

    const id = setInterval(() => {
      runScan();
    }, autoScanInterval);

    return () => {
      clearInterval(id);
    };
  }, [autoScanEnabled, autoScanInterval, runScan]);

  return {
    allPairs,
    selectedSymbols,
    scanResults,
    isScanning,
    lastScanAt,
    autoScanEnabled,
    autoScanInterval,
    runScan,
  };
}
