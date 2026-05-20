import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SignalResult } from "@/lib/signal/engine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SortField =
  | "score"
  | "trend"
  | "breakout"
  | "momentum"
  | "volatility"
  | "rs";

export interface Ticker {
  symbol: string; // full Binance symbol (e.g. "BTCUSDT")
  base: string; // display name (e.g. "BTC")
  price: number;
  change: number; // % 24h
  volume: number; // USDT volume 24h
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface ScannerState {
  // All USDT pairs from Binance
  allPairs: Ticker[];
  // User-selected symbols to show in watchlist
  selectedSymbols: string[];
  // Signal scan results
  scanResults: SignalResult[];
  // UI state
  isScanning: boolean;
  lastScanAt: number | null;
  // Auto-scan
  autoScanEnabled: boolean;
  autoScanInterval: number;
  // Sort
  sortBy: SortField;

  // Actions
  setAllPairs: (pairs: Ticker[]) => void;
  setSelectedSymbols: (symbols: string[]) => void;
  toggleSymbol: (symbol: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectTop: (n: number) => void;
  setScanResults: (results: SignalResult[]) => void;
  setIsScanning: (v: boolean) => void;
  setAutoScanEnabled: (v: boolean) => void;
  setAutoScanInterval: (ms: number) => void;
  setSortBy: (field: SortField) => void;
}

/** Normalize a symbol to always include the USDT suffix */
function normalizeUsdtPair(symbol: string): string {
  return symbol.endsWith("USDT") ? symbol : `${symbol}USDT`;
}

export const useScannerStore = create<ScannerState>()(
  persist(
    (set, get) => ({
      allPairs: [],
      selectedSymbols: [],
      scanResults: [],
      isScanning: false,
      lastScanAt: null,
      autoScanEnabled: false,
      autoScanInterval: 300000,
      sortBy: "score" as SortField,

      setAllPairs: (pairs) => set({ allPairs: pairs }),
      setSelectedSymbols: (symbols) =>
        set({ selectedSymbols: symbols.map(normalizeUsdtPair) }),
      toggleSymbol: (symbol) => {
        const norm = normalizeUsdtPair(symbol);
        const current = get().selectedSymbols;
        if (current.includes(norm)) {
          set({ selectedSymbols: current.filter((s) => s !== norm) });
        } else {
          set({ selectedSymbols: [...current, norm] });
        }
      },
      selectAll: () =>
        set({ selectedSymbols: get().allPairs.map((p) => p.symbol) }),
      deselectAll: () => set({ selectedSymbols: [] }),
      selectTop: (n) =>
        set({
          selectedSymbols: get()
            .allPairs.sort((a, b) => b.volume - a.volume)
            .slice(0, n)
            .map((p) => p.symbol),
        }),
      setScanResults: (results) =>
        set({ scanResults: results, lastScanAt: Date.now() }),
      setIsScanning: (v) => set({ isScanning: v }),
      setAutoScanEnabled: (v) => set({ autoScanEnabled: v }),
      setAutoScanInterval: (ms) => set({ autoScanInterval: ms }),
      setSortBy: (field) => set({ sortBy: field }),
    }),
    {
      name: "miura-scanner-state",
      partialize: (state) => ({
        selectedSymbols: state.selectedSymbols,
        autoScanEnabled: state.autoScanEnabled,
        autoScanInterval: state.autoScanInterval,
        sortBy: state.sortBy,
      }),
      /** Migrate stale persisted state: ensure all symbols have USDT suffix */
      migrate: (persisted: unknown) => {
        const p = persisted as Record<string, unknown>;
        if (!p) return p;
        if (Array.isArray(p.selectedSymbols)) {
          p.selectedSymbols = (p.selectedSymbols as string[]).map(
            (s: string) =>
              s.endsWith("USDT") ? s : `${s}USDT`,
          );
        }
        return p;
      },
      version: 1,
    },
  ),
);
