"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Zap, Loader2, Timer, BarChart3 } from "lucide-react";
import { getBinanceWS } from "@/lib/binance/ws";
import { useChartStore } from "@/lib/store/chart-store";
import { useScannerStore, type SortField } from "@/lib/store/scanner-store";
import { useScanner } from "@/hooks/useScanner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PairSelector } from "./PairSelector";
import { SignalDetailPanel } from "./SignalDetailPanel";
import { RelativeStrengthView } from "./RelativeStrengthView";
import { formatPrice, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SignalState } from "@/lib/oakscript/indicators";

const INTERVAL_OPTIONS = [
  { label: "1m", value: 60000 },
  { label: "5m", value: 300000 },
  { label: "15m", value: 900000 },
  { label: "30m", value: 1800000 },
  { label: "1h", value: 3600000 },
] as const;

const SORT_OPTIONS: { label: string; value: SortField }[] = [
  { label: "Score", value: "score" },
  { label: "Trend", value: "trend" },
  { label: "Breakout", value: "breakout" },
  { label: "Momentum", value: "momentum" },
  { label: "Volatility", value: "volatility" },
  { label: "RS", value: "rs" },
];

const STATE_BADGE_STYLES: Record<SignalState, string> = {
  "HIGH PRIORITY": "bg-green-500/90 text-white",
  STRONG: "bg-green-600/80 text-white",
  WATCH: "bg-amber-500/80 text-white",
  WEAK: "bg-orange-500/80 text-white",
  AVOID: "bg-red-500/80 text-white",
};

const STATE_ROW_BG: Record<SignalState, string> = {
  "HIGH PRIORITY": "bg-green-500/[0.06]",
  STRONG: "bg-green-500/[0.06]",
  WATCH: "bg-amber-500/[0.06]",
  WEAK: "bg-orange-500/[0.04]",
  AVOID: "bg-red-500/[0.06]",
};

interface Row {
  symbol: string;
  price: number;
  pct: number;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-1 w-6 rounded-full bg-tv-border/40">
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function Watchlist() {
  const chartSymbol = useChartStore((s) => s.symbol);
  const setSymbol = useChartStore((s) => s.setSymbol);
  const selectedSymbols = useScannerStore((s) => s.selectedSymbols);
  const allPairs = useScannerStore((s) => s.allPairs);
  const scanResults = useScannerStore((s) => s.scanResults);
  const sortBy = useScannerStore((s) => s.sortBy);
  const setAutoScanEnabled = useScannerStore((s) => s.setAutoScanEnabled);
  const setAutoScanInterval = useScannerStore((s) => s.setAutoScanInterval);
  const setSortBy = useScannerStore((s) => s.setSortBy);
  const {
    runScan,
    isScanning,
    autoScanEnabled,
    autoScanInterval,
  } = useScanner();

  const [rows, setRows] = useState<Record<string, Row>>({});
  const [flash, setFlash] = useState<Record<string, "up" | "down" | null>>({});
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"watchlist" | "ranking">("watchlist");

  const handleRowClick = useCallback(
    (symbol: string) => {
      setSymbol(symbol);
      setSelectedDetail((prev) => (prev === symbol ? null : symbol));
    },
    [setSymbol],
  );

  useEffect(() => {
    if (allPairs.length === 0) return;
    setRows((prev) => {
      const next = { ...prev };
      for (const p of allPairs) {
        if (!next[p.symbol]) {
          next[p.symbol] = {
            symbol: p.symbol,
            price: p.price,
            pct: p.change,
          };
        }
      }
      return next;
    });
  }, [allPairs]);

  useEffect(() => {
    if (selectedSymbols.length === 0) return;
    const ws = getBinanceWS();
    const unsub = ws.subscribeMiniTickers(selectedSymbols, (tick) => {
      setRows((prev) => {
        const prevRow = prev[tick.symbol];
        if (prevRow) {
          if (tick.close > prevRow.price) {
            setFlash((f) => ({ ...f, [tick.symbol]: "up" }));
            setTimeout(() => setFlash((f) => ({ ...f, [tick.symbol]: null })), 300);
          } else if (tick.close < prevRow.price) {
            setFlash((f) => ({ ...f, [tick.symbol]: "down" }));
            setTimeout(() => setFlash((f) => ({ ...f, [tick.symbol]: null })), 300);
          }
        }
        return {
          ...prev,
          [tick.symbol]: {
            symbol: tick.symbol,
            price: tick.close,
            pct: tick.pct,
          },
        };
      });
    });
    return () => {
      unsub();
    };
  }, [selectedSymbols]);

  const merged = useMemo(() => {
    const scoreMap = new Map(scanResults.map((r) => [r.symbol, r]));
    return selectedSymbols
      .map((s) => ({
        symbol: s,
        row: rows[s],
        signal: scoreMap.get(s),
      }))
      .sort((a, b) => {
        const sA = a.signal;
        const sB = b.signal;
        if (!sA && !sB) return 0;
        if (!sA) return 1;
        if (!sB) return -1;
        switch (sortBy) {
          case "trend":
            return sB.trend - sA.trend;
          case "breakout":
            return sB.breakout - sA.breakout;
          case "momentum":
            return sB.momentum - sA.momentum;
          case "volatility":
            return sB.volatility - sA.volatility;
          case "rs":
            return (sA.rsRank ?? 999) - (sB.rsRank ?? 999);
          default:
            return sB.score - sA.score;
        }
      });
  }, [selectedSymbols, rows, scanResults, sortBy]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-tv-border px-3 py-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-tv-text-muted">
          Watchlist
        </h2>
        <div className="flex items-center gap-1 rounded border border-tv-border bg-tv-bg p-0.5">
          <button
            onClick={() => setViewMode("watchlist")}
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
              viewMode === "watchlist"
                ? "bg-tv-panel-hover text-tv-text"
                : "text-tv-text-dim hover:text-tv-text-muted",
            )}
          >
            Watchlist
          </button>
          <button
            onClick={() => setViewMode("ranking")}
            className={cn(
              "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
              viewMode === "ranking"
                ? "bg-tv-panel-hover text-tv-text"
                : "text-tv-text-dim hover:text-tv-text-muted",
            )}
          >
            <BarChart3 className="h-3 w-3" />
            Ranking
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-scan toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAutoScanEnabled(!autoScanEnabled)}
              className={cn(
                "flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium transition-colors",
                autoScanEnabled
                  ? "text-tv-green hover:bg-tv-green/10"
                  : "text-tv-text-dim hover:bg-tv-panel-hover",
              )}
              title="Auto-scan"
            >
              <Timer className="h-3 w-3" />
              <span>Auto</span>
            </button>
            {autoScanEnabled && (
              <select
                value={autoScanInterval}
                onChange={(e) => setAutoScanInterval(Number(e.target.value))}
                className="rounded border border-tv-border bg-tv-bg px-1 py-0.5 text-[10px] text-tv-text focus:border-tv-blue focus:outline-none"
              >
                {INTERVAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          {/* Manual scan button */}
          <button
            onClick={runScan}
            disabled={isScanning || selectedSymbols.length === 0}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors",
              isScanning
                ? "cursor-not-allowed text-tv-text-dim"
                : "text-tv-blue hover:bg-tv-blue/10",
            )}
            title="Ejecutar scanner Turtle_Miura"
          >
            {isScanning ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Zap className="h-3 w-3" />
            )}
            {isScanning ? "Scanning..." : "Scan"}
          </button>
        </div>
      </div>

      {/* Pair selector */}
      <PairSelector />

      {viewMode === "ranking" ? (
        <div className="flex-1">
          <RelativeStrengthView />
        </div>
      ) : (
      <>
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-1 border-b border-tv-border px-3 py-1.5 text-[10px] uppercase tracking-wider text-tv-text-dim">
        <span>Par</span>
        <span className="text-right">Precio</span>
        <span className="text-right">24h</span>
        <div className="flex items-center justify-end gap-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="rounded border border-tv-border bg-tv-bg px-1 py-0 text-[9px] text-tv-text-dim focus:border-tv-blue focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rows */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {merged.map(({ symbol: s, row, signal }) => {
            const isActive = s === chartSymbol;
            const f = flash[s];
            const state = signal?.state;
            const stateColor = signal
              ? signal.score >= 80
                ? "text-tv-green"
                : signal.score >= 65
                  ? "text-tv-yellow"
                  : signal.score >= 40
                    ? "text-tv-text-muted"
                    : "text-tv-red"
              : "text-tv-text-dim";
            const rowBg = state ? STATE_ROW_BG[state] : "";
            const isDetailOpen = selectedDetail === s;

            return (
              <div key={s}>
                <div
                  onClick={() => handleRowClick(s)}
                  className={cn(
                    "group grid cursor-pointer grid-cols-[1fr_auto_auto_auto] items-center gap-1 px-3 py-1.5 text-xs transition-colors",
                    "hover:bg-tv-panel-hover",
                    isActive && "bg-tv-panel-hover",
                    isDetailOpen && "border-b-0",
                    rowBg,
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      {state && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded px-1 py-px text-[8px] font-bold leading-none",
                            STATE_BADGE_STYLES[state],
                          )}
                        >
                          {state === "HIGH PRIORITY" ? "HP" : state.slice(0, 1)}
                        </span>
                      )}
                      <span className="font-medium text-tv-text">
                        {s.endsWith("USDT") ? s.slice(0, -4) : s}
                      </span>
                      <span className="text-[10px] text-tv-text-dim">USDT</span>
                      {signal != null && (
                        <span
                          className={cn(
                            "text-[10px] tabular-nums font-medium",
                            stateColor,
                          )}
                        >
                          {signal.score}
                        </span>
                      )}
                    </div>
                    {signal && (
                      <div className="flex items-center gap-1">
                        <MiniBar value={signal.trend} max={25} color="#3b82f6" />
                        <MiniBar value={signal.breakout} max={25} color="#f59e0b" />
                        <MiniBar value={signal.momentum} max={25} color="#a855f7" />
                        <MiniBar value={signal.volatility} max={25} color="#26a69a" />
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-right tabular-nums transition-colors",
                      f === "up" && "text-tv-green",
                      f === "down" && "text-tv-red",
                      !f && "text-tv-text",
                    )}
                  >
                    {row ? formatPrice(row.price) : "—"}
                  </span>
                  <span
                    className={cn(
                      "w-14 text-right tabular-nums",
                      row
                        ? row.pct >= 0
                          ? "text-tv-green"
                          : "text-tv-red"
                        : "text-tv-text-muted",
                    )}
                  >
                    {row ? formatPct(row.pct) : "—"}
                  </span>
                  <span
                    className={cn(
                      "w-8 text-right tabular-nums font-medium",
                      stateColor,
                    )}
                  >
                    {signal ? signal.score : "—"}
                  </span>
                </div>
                {isDetailOpen && <SignalDetailPanel symbol={s} />}
              </div>
            );
          })}
          {selectedSymbols.length === 0 && (
            <div className="p-4 text-center text-xs text-tv-text-muted">
              Selecciona pares arriba para empezar
            </div>
          )}
        </div>
      </ScrollArea>
      </>
      )}
    </div>
  );
}
