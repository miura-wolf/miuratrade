// src/lib/backtest/engine.ts
import type { Candle } from "@/lib/binance/types";
import { sma, ema, rsi, macd, atr, bollingerBands, stochastic, preloadIndicators } from "@/lib/indicators";

/** Position direction */
export type PositionSide = "long" | "short";

/** A single trade executed during backtesting */
export interface Trade {
  side: PositionSide;
  entryTime: number;
  entryPrice: number;
  exitTime: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPct: number;
}

/** Equity curve point */
export interface EquityPoint {
  time: number;
  equity: number;
}

/** Backtest configuration */
export interface BacktestConfig {
  /** Initial capital in quote currency (e.g., USDT) */
  initialCapital: number;
  /** Commission per trade as a fraction (e.g., 0.001 = 0.1%) */
  commission: number;
  /** Position size as fraction of equity (0–1) */
  positionSize: number;
  /** Strategy entry rule */
  entryRule: EntryRule;
  /** Strategy exit rule */
  exitRule: ExitRule;
  /** Optional: start date (unix seconds) */
  startDate?: number;
  /** Optional: end date (unix seconds) */
  endDate?: number;
}

/** Entry rule types */
export type EntryRule =
  | { type: "sma_cross"; fastPeriod: number; slowPeriod: number }
  | { type: "rsi_oversold"; period: number; threshold: number }
  | { type: "bollinger_lower"; period: number; stdDev: number }
  | { type: "macd_signal"; fast: number; slow: number; signal: number };

/** Exit rule types */
export type ExitRule =
  | { type: "sma_cross_exit"; fastPeriod: number; slowPeriod: number }
  | { type: "rsi_overbought"; period: number; threshold: number }
  | { type: "bollinger_upper"; period: number; stdDev: number }
  | { type: "stop_loss_take_profit"; stopLossPct: number; takeProfitPct: number }
  | { type: "macd_signal_exit"; fast: number; slow: number; signal: number };

/** Full backtest result */
export interface BacktestResult {
  trades: Trade[];
  equityCurve: EquityPoint[];
  finalEquity: number;
  totalReturn: number;
  totalReturnPct: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  avgTradePnl: number;
  avgTradePnlPct: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
}

/**
 * Run a backtest on historical candle data with the given configuration.
 */
export async function runBacktest(
  candles: Candle[],
  config: BacktestConfig,
): Promise<BacktestResult> {
  // Ensure indicators library is loaded
  await preloadIndicators();

  // Filter by date range if specified
  let data = candles;
  if (config.startDate) data = data.filter((c) => c.time >= config.startDate!);
  if (config.endDate) data = data.filter((c) => c.time <= config.endDate!);

  if (data.length < 2) {
    return emptyResult(config.initialCapital);
  }

  // Pre-compute indicators based on entry/exit rules
  const entrySignals = computeEntrySignals(data, config.entryRule);
  const exitSignals = computeExitSignals(data, config.exitRule);

  // Simulation
  let equity = config.initialCapital;
  let position: { side: PositionSide; entryPrice: number; entryTime: number; quantity: number } | null = null;
  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [{ time: data[0].time, equity }];
  let peakEquity = equity;
  let maxDrawdown = 0;

  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    const entry = entrySignals[i];
    const exit = exitSignals[i];

    // Check exit first
    if (position) {
      let shouldExit = false;
      let exitPrice = candle.close;

      if (exit) {
        shouldExit = true;
      }

      // Stop-loss / take-profit check
      if (position.side === "long") {
        const pnlPct = (candle.close - position.entryPrice) / position.entryPrice;
        if (config.exitRule.type === "stop_loss_take_profit") {
          if (pnlPct <= -config.exitRule.stopLossPct || pnlPct >= config.exitRule.takeProfitPct) {
            shouldExit = true;
          }
        }
      } else {
        const pnlPct = (position.entryPrice - candle.close) / position.entryPrice;
        if (config.exitRule.type === "stop_loss_take_profit") {
          if (pnlPct <= -config.exitRule.stopLossPct || pnlPct >= config.exitRule.takeProfitPct) {
            shouldExit = true;
          }
        }
      }

      if (shouldExit) {
        const rawPnl = position.side === "long"
          ? (exitPrice - position.entryPrice) * position.quantity
          : (position.entryPrice - exitPrice) * position.quantity;
        const commissionCost = exitPrice * position.quantity * config.commission;
        const pnl = rawPnl - commissionCost;
        const pnlPct = position.side === "long"
          ? (exitPrice - position.entryPrice) / position.entryPrice
          : (position.entryPrice - exitPrice) / position.entryPrice;

        trades.push({
          side: position.side,
          entryTime: position.entryTime,
          entryPrice: position.entryPrice,
          exitTime: candle.time,
          exitPrice,
          quantity: position.quantity,
          pnl,
          pnlPct,
        });

        equity += pnl;
        position = null;
      }
    }

    // Check entry
    if (!position && entry) {
      const side: PositionSide = entry;
      const investAmount = equity * config.positionSize;
      const commissionCost = investAmount * config.commission;
      const quantity = (investAmount - commissionCost) / candle.close;

      position = {
        side,
        entryPrice: candle.close,
        entryTime: candle.time,
        quantity,
      };
    }

    // Track equity
    const currentEquity = position
      ? equity + (position.side === "long"
          ? (candle.close - position.entryPrice) * position.quantity
          : (position.entryPrice - candle.close) * position.quantity)
      : equity;

    equityCurve.push({ time: candle.time, equity: currentEquity });

    // Track drawdown
    if (currentEquity > peakEquity) peakEquity = currentEquity;
    const dd = peakEquity - currentEquity;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  // Close any open position at the end
  if (position) {
    const lastCandle = data[data.length - 1];
    const exitPrice = lastCandle.close;
    const rawPnl = position.side === "long"
      ? (exitPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - exitPrice) * position.quantity;
    const commissionCost = exitPrice * position.quantity * config.commission;
    const pnl = rawPnl - commissionCost;
    const pnlPct = position.side === "long"
      ? (exitPrice - position.entryPrice) / position.entryPrice
      : (position.entryPrice - exitPrice) / position.entryPrice;

    trades.push({
      side: position.side,
      entryTime: position.entryTime,
      entryPrice: position.entryPrice,
      exitTime: lastCandle.time,
      exitPrice,
      quantity: position.quantity,
      pnl,
      pnlPct,
    });

    equity += pnl;
  }

  // Compute stats
  const finalEquity = equity;
  const totalReturn = finalEquity - config.initialCapital;
  const totalReturnPct = totalReturn / config.initialCapital;
  const maxDrawdownPct = peakEquity > 0 ? maxDrawdown / peakEquity : 0;
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  const winRate = trades.length > 0 ? wins.length / trades.length : 0;
  const avgTradePnl = trades.length > 0 ? trades.reduce((s, t) => s + t.pnl, 0) / trades.length : 0;
  const avgTradePnlPct = trades.length > 0 ? trades.reduce((s, t) => s + t.pnlPct, 0) / trades.length : 0;
  const bestTrade = trades.length > 0 ? Math.max(...trades.map((t) => t.pnl)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map((t) => t.pnl)) : 0;
  const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Sharpe ratio (annualized, assuming ~252 trading days, daily returns)
  const dailyReturns = equityCurve.slice(1).map((p, i) => {
    const prev = equityCurve[i]?.equity ?? config.initialCapital;
    return prev > 0 ? (p.equity - prev) / prev : 0;
  });
  const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length : 0;
  const stdReturn = dailyReturns.length > 1
    ? Math.sqrt(dailyReturns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / (dailyReturns.length - 1))
    : 0;
  const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(252) : 0;

  return {
    trades,
    equityCurve,
    finalEquity,
    totalReturn,
    totalReturnPct,
    maxDrawdown,
    maxDrawdownPct,
    sharpeRatio,
    winRate,
    totalTrades: trades.length,
    avgTradePnl,
    avgTradePnlPct,
    bestTrade,
    worstTrade,
    profitFactor,
  };
}

/**
 * Compute entry signals for each candle.
 * Returns an array where each element is either "long", "short", or null.
 */
function computeEntrySignals(
  candles: Candle[],
  rule: EntryRule,
): (PositionSide | null)[] {
  const signals: (PositionSide | null)[] = new Array(candles.length).fill(null);

  switch (rule.type) {
    case "sma_cross": {
      const fastSma = sma(candles, rule.fastPeriod);
      const slowSma = sma(candles, rule.slowPeriod);
      const fastByTime = new Map(fastSma.map((p) => [p.time, p.value]));
      const slowByTime = new Map(slowSma.map((p) => [p.time, p.value]));

      let prevFast: number | undefined;
      let prevSlow: number | undefined;

      for (let i = 0; i < candles.length; i++) {
        const t = candles[i].time;
        const fast = fastByTime.get(t);
        const slow = slowByTime.get(t);

        if (fast !== undefined && slow !== undefined && prevFast !== undefined && prevSlow !== undefined) {
          if (prevFast <= prevSlow && fast > slow) signals[i] = "long";
          else if (prevFast >= prevSlow && fast < slow) signals[i] = "short";
        }

        prevFast = fast;
        prevSlow = slow;
      }
      break;
    }

    case "rsi_oversold": {
      const rsiData = rsi(candles, rule.period);
      const rsiByTime = new Map(rsiData.map((p) => [p.time, p.value]));

      for (let i = 0; i < candles.length; i++) {
        const rsiVal = rsiByTime.get(candles[i].time);
        if (rsiVal !== undefined && rsiVal < rule.threshold) {
          signals[i] = "long";
        }
      }
      break;
    }

    case "bollinger_lower": {
      const bbData = bollingerBands(candles, rule.period, rule.stdDev);
      const lowerByTime = new Map(bbData.map((p) => [p.time, p.lower]));

      for (let i = 0; i < candles.length; i++) {
        const lower = lowerByTime.get(candles[i].time);
        if (lower !== undefined && candles[i].close <= lower) {
          signals[i] = "long";
        }
      }
      break;
    }

    case "macd_signal": {
      const macdData = macd(candles, rule.fast, rule.slow, rule.signal);
      const macdByTime = new Map(macdData.map((p) => [p.time, p]));

      let prevMacd: number | undefined;
      let prevSignal: number | undefined;

      for (let i = 0; i < candles.length; i++) {
        const m = macdByTime.get(candles[i].time);
        if (m && prevMacd !== undefined && prevSignal !== undefined) {
          if (prevMacd <= prevSignal && m.macd > m.signal) signals[i] = "long";
          else if (prevMacd >= prevSignal && m.macd < m.signal) signals[i] = "short";
        }
        if (m) {
          prevMacd = m.macd;
          prevSignal = m.signal;
        }
      }
      break;
    }
  }

  return signals;
}

/**
 * Compute exit signals for each candle.
 * Returns a boolean array indicating whether to exit at each candle.
 */
function computeExitSignals(
  candles: Candle[],
  rule: ExitRule,
): boolean[] {
  const signals: boolean[] = new Array(candles.length).fill(false);

  switch (rule.type) {
    case "sma_cross_exit": {
      const fastSma = sma(candles, rule.fastPeriod);
      const slowSma = sma(candles, rule.slowPeriod);
      const fastByTime = new Map(fastSma.map((p) => [p.time, p.value]));
      const slowByTime = new Map(slowSma.map((p) => [p.time, p.value]));

      let prevFast: number | undefined;
      let prevSlow: number | undefined;

      for (let i = 0; i < candles.length; i++) {
        const t = candles[i].time;
        const fast = fastByTime.get(t);
        const slow = slowByTime.get(t);

        if (fast !== undefined && slow !== undefined && prevFast !== undefined && prevSlow !== undefined) {
          if ((prevFast >= prevSlow && fast < slow) || (prevFast <= prevSlow && fast > slow)) {
            signals[i] = true;
          }
        }

        prevFast = fast;
        prevSlow = slow;
      }
      break;
    }

    case "rsi_overbought": {
      const rsiData = rsi(candles, rule.period);
      const rsiByTime = new Map(rsiData.map((p) => [p.time, p.value]));

      for (let i = 0; i < candles.length; i++) {
        const rsiVal = rsiByTime.get(candles[i].time);
        if (rsiVal !== undefined && rsiVal > rule.threshold) {
          signals[i] = true;
        }
      }
      break;
    }

    case "bollinger_upper": {
      const bbData = bollingerBands(candles, rule.period, rule.stdDev);
      const upperByTime = new Map(bbData.map((p) => [p.time, p.upper]));

      for (let i = 0; i < candles.length; i++) {
        const upper = upperByTime.get(candles[i].time);
        if (upper !== undefined && candles[i].close >= upper) {
          signals[i] = true;
        }
      }
      break;
    }

    case "stop_loss_take_profit": {
      // Handled inline in the main loop
      break;
    }

    case "macd_signal_exit": {
      const macdData = macd(candles, rule.fast, rule.slow, rule.signal);
      const macdByTime = new Map(macdData.map((p) => [p.time, p]));

      let prevMacd: number | undefined;
      let prevSignal: number | undefined;

      for (let i = 0; i < candles.length; i++) {
        const m = macdByTime.get(candles[i].time);
        if (m && prevMacd !== undefined && prevSignal !== undefined) {
          if ((prevMacd >= prevSignal && m.macd < m.signal) || (prevMacd <= prevSignal && m.macd > m.signal)) {
            signals[i] = true;
          }
        }
        if (m) {
          prevMacd = m.macd;
          prevSignal = m.signal;
        }
      }
      break;
    }
  }

  return signals;
}

function emptyResult(initialCapital: number): BacktestResult {
  return {
    trades: [],
    equityCurve: [{ time: 0, equity: initialCapital }],
    finalEquity: initialCapital,
    totalReturn: 0,
    totalReturnPct: 0,
    maxDrawdown: 0,
    maxDrawdownPct: 0,
    sharpeRatio: 0,
    winRate: 0,
    totalTrades: 0,
    avgTradePnl: 0,
    avgTradePnlPct: 0,
    bestTrade: 0,
    worstTrade: 0,
    profitFactor: 0,
  };
}
