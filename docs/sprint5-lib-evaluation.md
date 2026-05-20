# Sprint 5 — Library Evaluation Report

Evaluated: 2026-05-18

## 1. lightweight-charts-react-wrapper

**Package**: `lightweight-charts-react-wrapper` (npm v1.3.2)
**Repo**: `TRASH-AND-FIRE/lightweight-charts-react-wrapper` (122 stars)

### Verdict: SKIP

- Built for **lightweight-charts v4**; project runs **v5.2.0**
- Last npm publish: **May 2022** (3+ years stale), 17 weekly downloads
- Open issue #23 requests v5 support (multi-pane API) — no assignee, no PR
- The project's PriceChart.tsx relies heavily on v5's multi-pane system (`chart.panes()`, `addSeries(Type, opts, paneIndex)`, `pane.setStretchFactor()`) which the wrapper does not model
- Adapting would require forking and extending significantly — not worth the maintenance cost
- The current imperative `createChart()` + `useRef` pattern is ugly but fully v5-native and functional

---

## 2. awesome-pinescript

**Repo**: `pinecoders/awesome-pinescript` (~1.8k stars)
**Nature**: Curated list (awesome-list) of community Pine Script indicators. Not a library.

### Verdict: DEFER

- Not directly integrable — it's a catalog, not code
- Valuable as a **reference source** for indicator algorithms to translate to oakscriptJS
- High-value translation candidates when expanding the indicator library:
  - **Flag Finder** (Breakout) — identifies flag/pennant patterns, stronger signal confirmation than current Donchian-based breakout
  - **Cycles Analysis** (Trend) — detects market cycle periodicity, orthogonal to MA-based trend detection
  - **Mean Reversion Channel** (Volatility) — range-bound context the current ATR-based indicator lacks
  - **ICT Killzones Pivots TFO** (Breakout/Momentum) — session-based breakout levels, relevant for crypto liquidity clusters
- Translation effort is non-trivial per indicator; should follow user demand, not catalog breadth
- Each linked script has its own license — verify per-script before porting

---

## 3. tradingview-udf-binance-node

**Repo**: `bergusman/tradingview-udf-binance-node` (153 stars)
**Nature**: Express.js server implementing TradingView Charting Library's UDF protocol for Binance data

### Verdict: SKIP

- **Architectural mismatch**: UDF is for the **TradingView Charting Library** (commercial widget), not lightweight-charts (open-source standalone library)
- lightweight-charts has no UDF client — it consumes data directly via `setData()`/`update()`
- Would require the commercial TradingView Charting Library (license agreement required) to benefit
- Last commit: December 2022 (3+ years old), REST-only (no WebSocket)
- Would add a separate Express server process alongside Next.js — breaks the Vercel deployment model
- The existing 43-line Next.js proxy route is simpler, more maintainable, and deployment-friendly

---

## 4. lwc-plugin-visible-price-range-util

**Package**: `lwc-plugin-visible-price-range-util` (npm v0.1.1)
**Repo**: `SlicedSilver/lwc-plugin-visible-price-range-util` (19 stars, by an LWC core maintainer)

### Verdict: DEFER

- Developed for **lightweight-charts v4.1.0**; project runs **v5.2.0**
- LWC v5 introduced breaking changes to the plugin/primitive API (`attachPrimitive` signature changed, pane architecture overhauled)
- No evidence of v5 compatibility; last publish October 2023
- Author (`SlicedSilver`) is a TradingView employee and LWC core maintainer — credible, but v5 compatibility unverified
- Could simplify breakout level visualization (auto-zoom to visible price range) if updated for v5
- Revisit when a v5-compatible version is released, or when LWC v5 plugin docs are finalized and we can build the same utility natively in ~20 lines using the v5 primitive API

---

## Summary

| Library | Verdict | Key Reason |
|---------|---------|------------|
| lightweight-charts-react-wrapper | **SKIP** | v4-only, abandoned, no v5/pane support |
| awesome-pinescript | **DEFER** | Reference catalog, not a dependency; translate Cycles + Flag Finder when needed |
| tradingview-udf-binance-node | **SKIP** | Architectural mismatch; UDF is for commercial TV Library, not LWC |
| lwc-plugin-visible-price-range-util | **DEFER** | v4-only, v5 incompatibility; revisit if author updates or build natively |
