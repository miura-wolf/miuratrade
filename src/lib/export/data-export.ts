// src/lib/export/data-export.ts
import type { Candle } from "@/lib/binance/types";
import type { BacktestResult, Trade } from "@/lib/backtest/engine";

/**
 * Convert candle data to CSV string.
 */
export function candlesToCSV(candles: Candle[]): string {
  const header = "time,open,high,low,close,volume";
  const rows = candles.map(
    (c) =>
      `${c.time},${c.open},${c.high},${c.low},${c.close},${c.volume}`,
  );
  return [header, ...rows].join("\n");
}

/**
 * Convert candle data to JSON string.
 */
export function candlesToJSON(candles: Candle[]): string {
  return JSON.stringify(
    candles.map((c) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    })),
    null,
    2,
  );
}

/**
 * Convert backtest trades to CSV string.
 */
export function tradesToCSV(trades: Trade[]): string {
  const header = "side,entryTime,entryPrice,exitTime,exitPrice,quantity,pnl,pnlPct";
  const rows = trades.map(
    (t) =>
      `${t.side},${t.entryTime},${t.entryPrice},${t.exitTime},${t.exitPrice},${t.quantity},${t.pnl},${t.pnlPct}`,
  );
  return [header, ...rows].join("\n");
}

/**
 * Convert backtest result to JSON string.
 */
export function backtestToJSON(result: BacktestResult): string {
  // Omit equity curve from summary for brevity
  const summary = {
    finalEquity: result.finalEquity,
    totalReturn: result.totalReturn,
    totalReturnPct: result.totalReturnPct,
    maxDrawdown: result.maxDrawdown,
    maxDrawdownPct: result.maxDrawdownPct,
    sharpeRatio: result.sharpeRatio,
    winRate: result.winRate,
    totalTrades: result.totalTrades,
    avgTradePnl: result.avgTradePnl,
    avgTradePnlPct: result.avgTradePnlPct,
    bestTrade: result.bestTrade,
    worstTrade: result.worstTrade,
    profitFactor: result.profitFactor,
    trades: result.trades,
  };
  return JSON.stringify(summary, null, 2);
}

/**
 * Convert equity curve to CSV string.
 */
export function equityCurveToCSV(
  curve: { time: number; equity: number }[],
): string {
  const header = "time,equity";
  const rows = curve.map((p) => `${p.time},${p.equity}`);
  return [header, ...rows].join("\n");
}

/**
 * Trigger a file download in the browser.
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download candle data as CSV.
 */
export function downloadCandlesCSV(
  candles: Candle[],
  symbol: string,
  timeframe: string,
): void {
  const csv = candlesToCSV(candles);
  downloadFile(csv, `${symbol}_${timeframe}_candles.csv`, "text/csv");
}

/**
 * Download candle data as JSON.
 */
export function downloadCandlesJSON(
  candles: Candle[],
  symbol: string,
  timeframe: string,
): void {
  const json = candlesToJSON(candles);
  downloadFile(json, `${symbol}_${timeframe}_candles.json`, "application/json");
}

/**
 * Download backtest result as JSON.
 */
export function downloadBacktestJSON(result: BacktestResult): void {
  const json = backtestToJSON(result);
  downloadFile(json, "backtest_result.json", "application/json");
}

/**
 * Download backtest trades as CSV.
 */
export function downloadTradesCSV(trades: Trade[]): void {
  const csv = tradesToCSV(trades);
  downloadFile(csv, "backtest_trades.csv", "text/csv");
}
