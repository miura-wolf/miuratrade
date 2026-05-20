"use client";

import { useScannerStore } from "@/lib/store/scanner-store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SignalState } from "@/lib/oakscript/indicators";
import type { SignalResult } from "@/lib/signal/engine";

const STATE_BADGE_STYLES: Record<SignalState, string> = {
  "HIGH PRIORITY": "bg-green-500/90 text-white",
  STRONG: "bg-green-600/80 text-white",
  WATCH: "bg-amber-500/80 text-white",
  WEAK: "bg-orange-500/80 text-white",
  AVOID: "bg-red-500/80 text-white",
};

const COMPONENTS = [
  {
    key: "trend" as const,
    label: "Trend Detection",
    color: "#3b82f6",
    details: (s: SignalResult) => [
      { label: "SMA20", value: formatPrice(s.details.sma20) },
      { label: "Trending", value: s.trend >= 25 ? "Yes" : "No" },
    ],
  },
  {
    key: "breakout" as const,
    label: "Breakout Detection",
    color: "#f59e0b",
    details: (s: SignalResult) => [
      { label: "Breakout", value: s.breakout >= 15 ? "Yes" : "No" },
      { label: "Vol Expanded", value: s.breakout >= 25 ? "Yes" : s.breakout >= 15 ? "Yes" : "No" },
    ],
  },
  {
    key: "momentum" as const,
    label: "Momentum",
    color: "#a855f7",
    details: (s: SignalResult) => [
      { label: "RSI", value: s.details.rsi.toFixed(1) },
      { label: "Bullish", value: s.details.rsi > 50 ? "Yes" : "No" },
    ],
  },
  {
    key: "volatility" as const,
    label: "Volatility",
    color: "#26a69a",
    details: (s: SignalResult) => [
      { label: "ATR", value: formatPrice(s.details.atr) },
      { label: "Healthy", value: s.volatility >= 15 ? "Yes" : "No" },
    ],
  },
];

interface SignalDetailPanelProps {
  symbol: string;
}

export function SignalDetailPanel({ symbol }: SignalDetailPanelProps) {
  const scanResults = useScannerStore((s) => s.scanResults);
  const signal = scanResults.find((r) => r.symbol === symbol);

  if (!signal) {
    return (
      <div className="border-t border-tv-border bg-[#131722] px-4 py-3 text-xs text-tv-text-dim">
        No signal data available
      </div>
    );
  }

  return (
    <div className="border-t border-tv-border bg-[#131722] px-4 py-3">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl font-bold tabular-nums text-tv-text">
          {signal.score}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold leading-none",
            STATE_BADGE_STYLES[signal.state],
          )}
        >
          {signal.state}
        </span>
        <span className="ml-auto text-[10px] tabular-nums text-tv-text-dim">
          Price: {formatPrice(signal.details.price)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {COMPONENTS.map((comp) => {
          const score = signal[comp.key];
          const pct = (score / 25) * 100;
          const detailItems = comp.details(signal);

          return (
            <div key={comp.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: comp.color }}
                >
                  {comp.label}
                </span>
                <span className="text-xs font-medium tabular-nums text-tv-text">
                  {score}
                  <span className="text-tv-text-dim">/25</span>
                </span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-tv-border/40">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: comp.color,
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                {detailItems.map((d) => (
                  <span
                    key={d.label}
                    className="text-[10px] tabular-nums text-tv-text-dim"
                  >
                    {d.label}:{" "}
                    <span className="text-tv-text">{d.value}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
