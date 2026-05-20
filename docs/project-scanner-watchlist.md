---
name: Scanner Store Architecture
description: Market scanner store + watchlist with ALL USDT pairs, multi-select, signal scores, and live WS updates
type: project
---

Scanner and watchlist architecture:

**Scanner store** (`src/lib/store/scanner-store.ts`):
- `allPairs` — ALL USDT pairs from Binance (no volume filter, no exceptions)
- `selectedSymbols` — user-selected pairs (persisted to localStorage) — stores FULL Binance symbols (e.g. "BTCUSDT")
- `scanResults` — SignalEngine evaluation results
- Actions: toggleSymbol, selectAll, deselectAll, selectTop(50/100)

**Ticker interface** — has both `symbol` (full, e.g. "BTCUSDT") and `base` (display, e.g. "BTC"). UI components use `base` for display, `symbol` for API calls.

**Data flow**:
1. `fetchAllUSDTTickers()` in `src/lib/binance/ticker.ts` — fetches ALL USDT pairs via **proxy** `/api/binance/ticker/24hr`, sorted by volume. Returns `{symbol, base, price, change, volume}`.
2. Scanner store populates `allPairs` on mount via `useScanner` hook
3. Watchlist initializes rows from `allPairs` (NOT from `fetchTickers24h` — that function is for specific symbols and doesn't work for the watchlist)
4. WebSocket handles live price updates for selected symbols (still direct to `wss://stream.binance.com:9443`)
5. Scan button triggers `useScanner.runScan()` — fetches candles in batches of 10, evaluates through SignalEngine

**Gotcha (2026-05-18):** `fetchTickers24h` was causing "Failed to fetch" errors because it constructs a JSON array as query param which Binance rejects. Watchlist was changed to use `allPairs` from scanner store instead. Also, stripping "USDT" from symbols caused 400 errors on klines — always keep full Binance symbol for API calls.

**Why:** User explicitly demanded ALL USDT pairs, no exceptions, with ability to select which ones to watch and scan.

**How to apply:** Don't use `fetchTickers24h` for the watchlist. Use `allPairs` from scanner store for initial data, WS for live updates. All REST calls go through the Next.js API proxy. Always store full Binance symbols (with USDT suffix).
