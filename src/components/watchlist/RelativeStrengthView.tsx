"use client";

import { useState, useMemo } from "react";
import { useScannerStore } from "@/lib/store/scanner-store";
import { useChartStore } from "@/lib/store/chart-store";
import { cn } from "@/lib/utils";
import type { SignalResult } from "@/lib/signal/engine";

type RSTab = "rs" | "trend" | "breakout" | "momentum";

const TABS: { key: RSTab; label: string; color: string }[] = [
  { key: "rs", label: "RS Total", color: "#22c55e" },
  { key: "trend", label: "Tendencia", color: "#3b82f6" },
  { key: "breakout", label: "Breakout", color: "#f59e0b" },
  { key: "momentum", label: "Momentum", color: "#a855f7" },
];

function getScore(result: SignalResult, tab: RSTab): number {
  switch (tab) {
    case "rs":
      return result.rsScore ?? 0;
    case "trend":
      return result.trend;
    case "breakout":
      return result.breakout;
    case "momentum":
      return result.momentum;
  }
}

function getMax(tab: RSTab): number {
  return tab === "rs" ? 100 : 25;
}

export function RelativeStrengthView() {
  const [activeTab, setActiveTab] = useState<RSTab>("rs");
  const scanResults = useScannerStore((s) => s.scanResults);
  const setSymbol = useChartStore((s) => s.setSymbol);
  const chartSymbol = useChartStore((s) => s.symbol);

  const ranked = useMemo(() => {
    const max = getMax(activeTab);
    return [...scanResults]
      .sort((a, b) => getScore(b, activeTab) - getScore(a, activeTab))
      .slice(0, 20)
      .map((r) => {
        const score = getScore(r, activeTab);
        return {
          symbol: r.symbol,
          score,
          pct: max > 0 ? (score / max) * 100 : 0,
        };
      });
  }, [scanResults, activeTab]);

  const tab = TABS.find((t) => t.key === activeTab)!;
  const max = getMax(activeTab);

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-tv-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex-1 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
              activeTab === t.key
                ? "border-b-2 text-tv-text"
                : "text-tv-text-dim hover:text-tv-text-muted",
            )}
            style={
              activeTab === t.key
                ? { borderColor: t.color, color: t.color }
                : undefined
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {ranked.length === 0 && (
          <div className="p-4 text-center text-xs text-tv-text-muted">
            Run a scan to see rankings
          </div>
        )}
        {ranked.map((item, i) => {
          const isActive = item.symbol === chartSymbol;
          const greenOpacity = Math.min(0.12, item.pct / 100 * 0.12);

          return (
            <div
              key={item.symbol}
              onClick={() => setSymbol(item.symbol)}
              className={cn(
                "group flex cursor-pointer items-center gap-2 px-3 py-1.5 transition-colors hover:bg-tv-panel-hover",
                isActive && "bg-tv-panel-hover",
              )}
              style={{ backgroundColor: `${tab.color}${Math.round(greenOpacity * 255).toString(16).padStart(2, "0")}` }}
            >
              <span className="w-5 text-right text-[10px] tabular-nums text-tv-text-muted">
                {i + 1}
              </span>

              <span className="w-16 text-xs font-medium text-tv-text truncate">
                {item.symbol.endsWith("USDT")
                  ? item.symbol.slice(0, -4)
                  : item.symbol}
                <span className="text-[10px] text-tv-text-dim">USDT</span>
              </span>

              <div className="flex-1 h-1.5 rounded-full bg-tv-border/40">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${item.pct}%`,
                    backgroundColor: tab.color,
                  }}
                />
              </div>

              <span
                className="w-10 text-right text-[10px] tabular-nums font-medium"
                style={{ color: tab.color }}
              >
                {item.score}/{max}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
