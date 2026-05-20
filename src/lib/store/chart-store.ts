"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Timeframe } from "@/lib/binance/types";

export type IndicatorKey =
  | "ema20"
  | "ema50"
  | "ema200"
  | "sma20"
  | "rsi"
  | "macd"
  | "volume"
  | "atr"
  | "breakout"
  // oakscriptJS strategy indicators
  | "tmTrend"
  | "tmBreakout"
  | "tmMomentum"
  | "tmVolatility"
  | "tmStrategy";

export type DrawingTool = "cursor" | "hline" | "measure" | "eraser";

export interface PriceLine {
  id: string;
  symbol: string;
  price: number;
}

export interface IndicatorConfig {
  ema20: number;
  ema50: number;
  ema200: number;
  sma20: number;
  rsi: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  atr: number;
  breakout: number;
  // oakscriptJS strategy indicator configs
  tmSmaPeriod: number;
  tmRangePeriod: number;
  tmVolumeMult: number;
  tmRsiPeriod: number;
  tmAtrPeriod: number;
  tmAtrThreshold: number;
}

export const DEFAULT_CONFIG: IndicatorConfig = {
  ema20: 20,
  ema50: 50,
  ema200: 200,
  sma20: 20,
  rsi: 14,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9,
  atr: 14,
  breakout: 20,
  // oakscriptJS strategy indicator defaults
  tmSmaPeriod: 20,
  tmRangePeriod: 20,
  tmVolumeMult: 1.5,
  tmRsiPeriod: 14,
  tmAtrPeriod: 14,
  tmAtrThreshold: 0.5,
};;

export const INDICATOR_COLORS: Record<IndicatorKey, string> = {
  ema20: "#ffb74d",
  ema50: "#2962ff",
  ema200: "#ab47bc",
  sma20: "#ff9800",
  rsi: "#ab47bc",
  macd: "#2962ff",
  volume: "#787b86",
  atr: "#26a69a",
  breakout: "#e91e63",
  // oakscriptJS strategy indicator colors
  tmTrend: "#3b82f6",
  tmBreakout: "#f59e0b",
  tmMomentum: "#a855f7",
  tmVolatility: "#26a69a",
  tmStrategy: "#22c55e",
};;

export const DEFAULT_WATCHLIST = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "ADAUSDT",
  "AVAXUSDT",
  "LINKUSDT",
  "MATICUSDT",
];

/** Normalize a symbol to always include the USDT suffix for Binance API calls */
function normalizeUsdtPair(symbol: string): string {
  return symbol.endsWith("USDT") ? symbol : `${symbol}USDT`;
}

interface ChartState {
  symbol: string;
  timeframe: Timeframe;
  /** Indicator is added to the chart (appears in pill + renders unless hidden) */
  indicators: Record<IndicatorKey, boolean>;
  /** Indicator is hidden (eye icon off) — kept in pill list, just not rendered */
  hidden: Record<IndicatorKey, boolean>;
  /** Periods and parameters for each indicator */
  config: IndicatorConfig;
  watchlist: string[];
  // Ephemeral UI state (not persisted)
  tool: DrawingTool;
  priceLines: PriceLine[];
  symbolDialogOpen: boolean;
  /** Which indicator's settings dialog is open (null = closed) */
  settingsTarget: IndicatorKey | null;

  // Actions
  setSymbol: (s: string) => void;
  setTimeframe: (t: Timeframe) => void;
  toggleIndicator: (key: IndicatorKey) => void;
  removeIndicator: (key: IndicatorKey) => void;
  toggleHidden: (key: IndicatorKey) => void;
  setConfig: (patch: Partial<IndicatorConfig>) => void;
  addToWatchlist: (s: string) => void;
  removeFromWatchlist: (s: string) => void;
  setTool: (t: DrawingTool) => void;
  addPriceLine: (price: number, symbol: string) => void;
  clearPriceLines: (symbol?: string) => void;
  setSymbolDialogOpen: (v: boolean) => void;
  setSettingsTarget: (k: IndicatorKey | null) => void;
}

export const useChartStore = create<ChartState>()(
  persist(
    (set) => ({
      symbol: "BTCUSDT",
      timeframe: "15m" as Timeframe,
      indicators: {
        ema20: true,
        ema50: true,
        ema200: false,
        sma20: false,
        rsi: true,
        macd: false,
        volume: true,
        atr: false,
        breakout: false,
        tmTrend: false,
        tmBreakout: false,
        tmMomentum: false,
        tmVolatility: false,
        tmStrategy: false,
      },
      hidden: {
        ema20: false,
        ema50: false,
        ema200: false,
        sma20: false,
        rsi: false,
        macd: false,
        volume: false,
        atr: false,
        breakout: false,
        tmTrend: false,
        tmBreakout: false,
        tmMomentum: false,
        tmVolatility: false,
        tmStrategy: false,
      },
      config: { ...DEFAULT_CONFIG },
      watchlist: DEFAULT_WATCHLIST,
      tool: "cursor",
      priceLines: [],
      symbolDialogOpen: false,
      settingsTarget: null,

      setSymbol: (symbol) =>
        set({ symbol: normalizeUsdtPair(symbol) }),
      setTimeframe: (timeframe) => set({ timeframe }),
      toggleIndicator: (key) =>
        set((s) => ({
          indicators: { ...s.indicators, [key]: !s.indicators[key] },
          // When re-adding, ensure not hidden
          hidden: !s.indicators[key]
            ? { ...s.hidden, [key]: false }
            : s.hidden,
        })),
      removeIndicator: (key) =>
        set((s) => ({
          indicators: { ...s.indicators, [key]: false },
          hidden: { ...s.hidden, [key]: false },
        })),
      toggleHidden: (key) =>
        set((s) => ({ hidden: { ...s.hidden, [key]: !s.hidden[key] } })),
      setConfig: (patch) =>
        set((s) => ({ config: { ...s.config, ...patch } })),
      addToWatchlist: (s) => {
        const norm = normalizeUsdtPair(s);
        return set((state) => ({
          watchlist: state.watchlist.includes(norm)
            ? state.watchlist
            : [...state.watchlist, norm],
        }));
      },
      removeFromWatchlist: (s) =>
        set((state) => ({
          watchlist: state.watchlist.filter((x) => x !== s),
        })),
      setTool: (tool) => set({ tool }),
      addPriceLine: (price, symbol) =>
        set((state) => ({
          priceLines: [
            ...state.priceLines,
            {
              id:
                typeof crypto !== "undefined" && "randomUUID" in crypto
                  ? crypto.randomUUID()
                  : `${Date.now()}-${Math.random()}`,
              symbol,
              price,
            },
          ],
        })),
      clearPriceLines: (symbol) =>
        set((state) => ({
          priceLines: symbol
            ? state.priceLines.filter((p) => p.symbol !== symbol)
            : [],
        })),
      setSymbolDialogOpen: (symbolDialogOpen) => set({ symbolDialogOpen }),
      setSettingsTarget: (settingsTarget) => set({ settingsTarget }),
    }),
    {
      name: "miura-chart-state",
      partialize: (s) => ({
        symbol: s.symbol,
        timeframe: s.timeframe,
        indicators: s.indicators,
        hidden: s.hidden,
        config: s.config,
        watchlist: s.watchlist,
      }),
      /** Migrate stale persisted state: ensure all symbols have USDT suffix */
      migrate: (persisted: unknown) => {
        const p = persisted as Record<string, unknown>;
        if (!p) return p;
        // Normalize chart symbol
        if (typeof p.symbol === "string" && !p.symbol.endsWith("USDT")) {
          p.symbol = `${p.symbol}USDT`;
        }
        // Normalize watchlist entries
        if (Array.isArray(p.watchlist)) {
          p.watchlist = p.watchlist.map((s: string) =>
            s.endsWith("USDT") ? s : `${s}USDT`,
          );
        }
        // Add missing TM indicator keys (v1 to v2 migration)
    const ind = p.indicators as Record<string, unknown> | undefined;
    if (ind) {
      if (ind.tmTrend === undefined) ind.tmTrend = false;
      if (ind.tmBreakout === undefined) ind.tmBreakout = false;
      if (ind.tmMomentum === undefined) ind.tmMomentum = false;
      if (ind.tmVolatility === undefined) ind.tmVolatility = false;
      if (ind.tmStrategy === undefined) ind.tmStrategy = false;
    }

    const hid = p.hidden as Record<string, unknown> | undefined;
    if (hid) {
      if (hid.tmTrend === undefined) hid.tmTrend = false;
      if (hid.tmBreakout === undefined) hid.tmBreakout = false;
      if (hid.tmMomentum === undefined) hid.tmMomentum = false;
      if (hid.tmVolatility === undefined) hid.tmVolatility = false;
      if (hid.tmStrategy === undefined) hid.tmStrategy = false;
    }

    const cfg = p.config as Record<string, unknown> | undefined;
    if (cfg) {
      if (cfg.tmSmaPeriod === undefined) cfg.tmSmaPeriod = 20;
      if (cfg.tmRangePeriod === undefined) cfg.tmRangePeriod = 20;
      if (cfg.tmVolumeMult === undefined) cfg.tmVolumeMult = 1.5;
      if (cfg.tmRsiPeriod === undefined) cfg.tmRsiPeriod = 14;
      if (cfg.tmAtrPeriod === undefined) cfg.tmAtrPeriod = 14;
      if (cfg.tmAtrThreshold === undefined) cfg.tmAtrThreshold = 0.5;
    }

    return p;
      },
      version: 2,
    },
  ),
);
