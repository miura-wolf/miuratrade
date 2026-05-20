# MiuraTrade 📈🐺

> **Open-source crypto trading dashboard with live charts, strategy scoring, and smart scanning.**
> Fork of [tradingview-gratis](https://github.com/outlinersclub-cpu/tradingview-gratis) with enhanced indicators, signal engine, and scanner.

---

## ✨ Features

### Charts & Data
- 📊 **Live candles** via Binance WebSocket (no API key)
- 🔍 **Symbol search** across all USDT pairs
- ⏱️ **Multi-timeframe**: 1m / 5m / 15m / 1h / 4h / 1d / 1w
- 🎨 **TradingView-identical visuals** (palette, fonts, layout)
- 📐 **Measure tool** — click two points to measure price change, duration, and %

### Indicators
- 📈 **Standard indicators**: EMA 20/50/200, SMA 20, RSI 14, MACD 12/26/9, ATR 14, Volume, Breakout Levels
- 🧠 **OakScriptJS indicators** — computed via [oakscriptJS](https://github.com/deepentropy/oakscriptJS) (PineScript-compatible TA library)
- ⚙️ **Configurable parameters** — all indicator settings editable via dialog (periods, multipliers, thresholds)

### Strategy & Scoring *(private fork only)*
- 🐢 **Turtle Miura composite strategy** — trend + breakout + momentum + volatility scoring (0-100)
- 🏷️ **Signal states**: HIGH PRIORITY / STRONG / WATCH / WEAK / AVOID
- 📊 **Strategy Score Panel** — floating score breakdown on chart
- 🎖️ **Strategy Score Badge** — inline state badge on chart

### Scanner & Watchlist
- 👁️ **Live watchlist** with prices and 24h change via WebSocket
- 🔴 **Signal state badges** per row (color-coded: green/yellow/orange/red)
- 📊 **Mini component bars** (trend/breakout/momentum/volatility per pair)
- 🔄 **Auto-scan** with configurable interval (1m / 5m / 15m / 30m / 1h)
- 📋 **Sort by** score, trend, breakout, momentum, or relative strength
- 🔎 **Signal Detail Panel** — expandable breakdown per pair
- 🏆 **Relative Strength View** — ranking view with tabs (RS / Trend / Breakout / Momentum)

### Infrastructure
- 💾 **Persistence** in localStorage (symbol, timeframe, indicators, watchlist, auto-scan prefs)
- 🔌 **Robust WebSocket reconnection** with exponential backoff
- ⚡ **BarData streaming** — incremental updates via oakscriptJS BarData (no full recalc on each tick)
- 🖥️ **HLines rendering** — reference price levels (RSI 30/50/70, etc.) rendered as price lines
- 🌐 100% client-side — static deploy on Vercel/Cloudflare

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styles | Tailwind CSS 4 + shadcn/ui |
| Charts | [lightweight-charts](https://github.com/tradingview/lightweight-charts) v5 |
| TA Library | [oakscriptJS](https://github.com/deepentropy/oakscriptJS) v0.2.8 |
| State | Zustand (with persist middleware) |
| Icons | lucide-react |
| Data | Binance Public REST + WebSocket |
| Testing | Vitest |

---

## 📐 Architecture

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard layout
│   ├── globals.css
│   └── api/binance/[...path]/      # Binance REST proxy
├── components/
│   ├── chart/
│   │   ├── PriceChart.tsx          # Chart core (LWC + panes + indicators)
│   │   ├── SymbolSelector.tsx      # Pair search
│   │   ├── TimeframeSelector.tsx
│   │   ├── IndicatorMenu.tsx       # Toggle indicators
│   │   ├── IndicatorPill.tsx
│   │   ├── IndicatorSettingsDialog.tsx  # Configure all indicator params
│   │   ├── MeasureOverlay.tsx      # Price/duration measurement
│   │   ├── StrategyScorePanel.tsx  # Score breakdown panel
│   │   └── StrategyScoreBadge.tsx  # Signal state badge
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── LeftSidebar.tsx
│   │   ├── RightSidebar.tsx
│   │   └── BottomPanel.tsx         # 24h stats
│   ├── watchlist/
│   │   ├── Watchlist.tsx           # Live watchlist + signal states
│   │   ├── PairSelector.tsx        # Multi-select pair picker
│   │   ├── SignalDetailPanel.tsx   # Expandable signal breakdown
│   │   └── RelativeStrengthView.tsx # Ranking view
│   └── ui/                         # shadcn primitives
├── lib/
│   ├── binance/
│   │   ├── rest.ts                 # klines / ticker / exchangeInfo
│   │   ├── ws.ts                   # WS multiplex + auto-reconnect
│   │   ├── ticker.ts               # All USDT tickers
│   │   └── types.ts
│   ├── indicators/
│   │   └── index.ts                # Legacy indicators (LWC-indicators)
│   ├── oakscript/
│   │   ├── index.ts                # OakScriptJS barrel
│   │   ├── renderer.ts             # IndicatorResult → LWC series
│   │   └── indicators/             # Strategy indicators (private)
│   ├── signal/
│   │   └── engine.ts               # Signal engine (private)
│   ├── store/
│   │   ├── chart-store.ts          # Chart + indicator state
│   │   └── scanner-store.ts        # Scanner + auto-scan state
│   └── format.ts
└── hooks/
    └── useScanner.ts               # Scanner hook + auto-scan
```

---

## 🧪 Testing

```bash
npm test
```

Integration tests cover the full pipeline: candle data → indicator calculation → signal scoring → ranking.

---

## 🌐 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or connect the repo at [vercel.com/new](https://vercel.com/new) for auto-deploy. No environment variables needed — everything is client-side.

---

## 🔒 Private vs Public

This repo contains the **public** version with stubs for the proprietary strategy files. The full MiuraTurtle strategy implementation (indicators, signal engine, renderer) is available in the private fork.

---

## 📄 License

MIT — use it, fork it, monetize it, whatever you want.

`lightweight-charts` is Apache 2.0 with attribution to TradingView — attribution lives in the footer/UI per license requirement.

`oakscriptJS` is MIT licensed.
