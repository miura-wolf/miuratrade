---
name: tradingview-gratis project overview
description: MiuraTrade — Crypto Trading OS. All indicators + SignalEngine + scanner complete. Next: feature roadmap (7 layers, ~25 features)
type: project
---

**miura-trade** (renamed from tradingview-gratis 2026-05-18) is the codebase for **MiuraTrade** — a Crypto Trading OS.

**Stack**: Next.js 16.2.6, React 19, lightweight-charts v5.2, Zustand, shadcn/ui, Tailwind v4, Binance REST + WebSocket API.

**Current state**: Chart-focused — covers Layer 5 (Chart Confirmation) partially. No Supabase, PWA, radar, copilot, journal, or alerts yet.

**Structure**:
- `src/components/chart/` — PriceChart, SymbolSelector, TimeframeSelector, IndicatorMenu/Pill/SettingsDialog, MeasureOverlay, OakScriptDemo
- `src/components/layout/` — Header, LeftSidebar, RightSidebar, BottomPanel
- `src/components/ui/` — shadcn components
- `src/components/watchlist/` — Watchlist
- `src/lib/binance/` — REST + WS clients + types
- `src/lib/indicators/` — indicator logic (all powered by `lightweight-charts-indicators` lib: SMA, EMA, RSI, MACD, ATR, breakoutLevels). Boundary guards on period <= 0.
- `src/lib/oakscript/` — oakscriptjs wrapper (oakSMA, oakEMA, oakRSI, oakATR, oakBB)
- `src/lib/store/chart-store.ts` — Zustand chart store (persist key: `miura-chart-state`)
- `src/lib/store/scanner-store.ts` — Zustand scanner store (allPairs, selectedSymbols, scanResults; persists selectedSymbols to `miura-scanner-state`)
- `src/lib/signal/engine.ts` — Turtle_Miura SignalEngine (evaluateSignal, scanMarket) using oakscriptJS Series API
- `src/lib/binance/ticker.ts` — fetchAllUSDTTickers (ALL USDT pairs from Binance, sorted by volume)
- `src/hooks/useScanner.ts` — Scanner hook (fetches pairs, runs signal engine in batches of 10)
- `src/components/watchlist/PairSelector.tsx` — Multi-select pair picker with search + quick actions

## Turtle_Miura V1 — Indicator Sprint Plan (2026-05-17)

All 6 sprints COMPLETE as of 2026-05-17.

| Sprint | Status | Details |
|--------|--------|---------|
| 1 — Deps | ✅ | `lightweight-charts-indicators ^0.4.1` + `oakscriptjs ^0.2.8` in package.json |
| 2 — SMA/EMA to lib | ✅ | `sma()`/`ema()` use `LibSMA`/`LibEMA` from lib. `updateSMA20()` fixed. SMA20 pill wired. |
| 3 — RSI/MACD to lib | ✅ | Already use `LibRSI`/`LibMACD` with full pane rendering + pills |
| 4 — ATR | ✅ | Fully wired: store, menu ("Volatilidad"), chart pane, settings, pill with pane label. Period 14, color #26a69a. |
| 5 — SMA20 + Breakout | ✅ | SMA20 working. Breakout Levels: `breakoutLevels()` function, price lines (dashed, #e91e63), overlay pills, settings dialog, "Niveles" menu group. |
| 6 — oakscriptJS PoC | ✅ | `src/lib/oakscript/` wrapper + `OakScriptDemo` floating panel in chart. SMA/EMA/RSI/ATR/BB available via oakscriptjs ta-series API. |

**Binance API Proxy (2026-05-18):** Direct browser→Binance REST calls fail (CORS/network). Fixed with Next.js API route at `src/app/api/binance/[...path]/route.ts` that proxies all Binance REST calls. Both `rest.ts` and `ticker.ts` BASE changed to `/api/binance`. Ticker path fixed to `/ticker/24hr` (not `/api/v3/ticker/24hr` since proxy adds that). WebSocket still connects directly to `wss://stream.binance.com:9443` (may need proxy later).

**Why:** User is building toward the Turtle_Miura strategy (20D breakout, SMA20 rising, volume participation, BTC regime alignment). See team memory `project-miura-v2-refocus.md` for full spec.

**Docs audit (2026-05-18):** Foundation docs (agent, prd, architecture, strategy, ui-philosophy, roadmap) are current and valuable. `runtime-validation.md`, `workplan-v2-fixes.md`, and `phases/realtime/` are stale (reference components/backend that don't exist). `pwa-mobile-qa-checklist.md` is forward-looking.

**How to apply:** All indicator sprints done. SignalEngine + scanner + expanded watchlist all complete. Next: tune scoring weights, add realtime WS scan, explore remaining webs.md libs.

## Strategy Status (2026-05-18)

Indicators (visual) AND SignalEngine (logic) are BOTH complete.

**Visual layer:** SMA20, Volume, Breakout Levels, ATR — all render on chart.
**Logic layer:** SignalEngine in `src/lib/signal/engine.ts` — scores 0-100 using oakscriptJS Series API.
- Trend: price > SMA20, SMA20 rising, higher highs/lows
- Breakout: close > range high, volume > 1.5x average
- Momentum: RSI > 50, close rising, volume rising
- Volatility: ATR healthy, ATR expanding
- States: HIGH PRIORITY (95+), STRONG (80+), WATCH (65+), WEAK (40+), AVOID (<40)

**Docs priority:** Only `strategy-turtle-miura.md` and `webs.md` matter to user.
**Webs.md exploration:** Agents failed with rate limits. Not yet explored.

## Phase 2 — Completed (2026-05-18)

Rename + SignalEngine + Scanner + Watchlist expansion all complete. See Strategy Status section above.

## USDT Symbol Normalization (2026-05-18)

All symbols now stored with USDT suffix (e.g. "BTCUSDT"). Both stores have `normalizeUsdtPair()`:
- `chart-store.ts` — `setSymbol()` normalizes, `addToWatchlist()` normalizes, migration for stale persist
- `scanner-store.ts` — `toggleSymbol()` normalizes, `setSelectedSymbols()` normalizes, migration for stale persist
- `ticker.ts` — returns both `symbol` ("BTCUSDT") and `base` ("BTC") for display
- User fixed this themselves after initial implementation missed it

## Complete Feature Roadmap (2026-05-18)

User requested full plan. 7 layers, ~25 features:

| Layer | Key Features | Priority |
|-------|-------------|----------|
| 1. Scanner & Señales | Auto-Scan, Signal States, Alertas, Detail Panel | HIGH — core product |
| 2. Chart & Análisis | Multi-TF, PineScript Editor, Chart Trading | MEDIUM |
| 3. Journal & Tracking | Trade Journal, Performance Stats, Equity Curve | MEDIUM |
| 4. AI Chat | Context Chat, Signal Explanation, Trade Suggestion | LOW (needs backend) |
| 5. Alerts & Automation | Price Alerts, Signal Alerts, Webhooks | MEDIUM |
| 6. Backend & Sync | Supabase Auth, Data Persistence, Multi-Device | LOW |
| 7. PWA & Mobile | PWA Manifest, Mobile Layout, Push Notifications | LOW |

**Suggested sprint order:**
1-2: Auto-Scan + Signal States + Detail Panel
3-4: Trade Journal + Performance Stats
5-6: PineScript Editor (PoC exists)
7-8: Price/Signal Alerts
9-10: AI Chat
11+: Backend + PWA

## Pending / Next Steps

- Sprint 1: Auto-Scan (timed), Signal States (TRENDING/BREAKOUT/AVOID), Signal Detail Panel
- `awesome-pinescript` reference — for porting PineScript scripts to oakscriptJS
- Webs.md unexplored libs: lightweight-charts-react-wrapper, lwc-plugin-visible-price-range-util, tradingview-udf-binance-node
- WebSocket proxy — WS still connects directly to Binance, may need proxy for blocked regions
