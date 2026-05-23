import React from "react";
import { formatPrice, formatVolume } from "@/lib/format";

const greenOrRed = (val: number) => (val >= 0 ? "text-tv-green" : "text-tv-red");

export const ChartHeader = React.memo(function ChartHeader({ symbol, timeframe, hover, lastPrice, loading }: any) {
  return (
    <div className="absolute left-0 top-0 z-10 flex w-full flex-col p-2 pointer-events-none">
      <div className="flex flex-wrap items-center gap-x-3 overflow-hidden whitespace-nowrap">
        <div className="flex shrink-0 items-center gap-2 text-[13px] font-semibold">
          <span className="text-tv-text">{symbol}</span>
          <span className="text-tv-text-muted">·</span>
          <span className="uppercase text-tv-text-muted">{timeframe}</span>
          <span className="text-tv-text-muted">·</span>
          <span className="text-tv-text-muted">Binance</span>
        </div>
        {hover && (
          <div className="flex items-center gap-x-3 text-[11px]">
            <span className="text-tv-text-muted">
              O <span className={greenOrRed(hover.c - hover.o)}>{formatPrice(hover.o)}</span>
            </span>
            <span className="text-tv-text-muted">
              H <span className={greenOrRed(hover.c - hover.o)}>{formatPrice(hover.h)}</span>
            </span>
            <span className="text-tv-text-muted">
              L <span className={greenOrRed(hover.c - hover.o)}>{formatPrice(hover.l)}</span>
            </span>
            <span className="text-tv-text-muted">
              C <span className={greenOrRed(hover.c - hover.o)}>{formatPrice(hover.c)}</span>
            </span>
            <span className={greenOrRed(hover.pct)}>
              {hover.pct >= 0 ? "+" : ""}
              {hover.pct.toFixed(2)}%
            </span>
            <span className="text-tv-text-muted">
              Vol <span className="text-tv-text">{formatVolume(hover.v)}</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex h-7 items-center gap-2">
        {loading ? (
          <span className="text-xs text-tv-text-muted animate-pulse">Cargando…</span>
        ) : lastPrice ? (
          <>
            <span className={`text-lg font-semibold tabular-nums ${greenOrRed(lastPrice.pct)}`}>
              {formatPrice(lastPrice.value)}
            </span>
            <span className={`text-xs ${greenOrRed(lastPrice.pct)}`}>
              {lastPrice.pct >= 0 ? "+" : ""}
              {lastPrice.pct.toFixed(2)}%
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
});
