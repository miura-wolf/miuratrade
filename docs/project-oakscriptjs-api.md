---
name: oakscriptjs API surface
description: oakscriptjs v0.2.8 full API — ta functions, Series class with PineScript-like operators, BarData for streaming, crossover/crossunder support
type: project
---

**oakscriptjs** (`^0.2.8`) is installed and wraps PineScript v6 compatible TA in JavaScript. Confirmed more capable than initially assessed.

**Core API pattern**:
```ts
import { Series, ta } from "oakscriptjs";
const close = Series.fromBars(bars, "close");
const result = ta.sma(close, 20);
const points = result.toTimeValuePairs(); // Array<{time, value}>
```

**Available in `ta` (Series-based)**: `sma, ema, wma, vwma, rsi, macd, cci, stoch, bb, atr, stdev, crossover, crossunder, cross, change, mom, roc, highest, lowest, rising, falling, cum, supertrend, vwap`

**Available in `taCore` (array-based)**: `sma, ema, wma, rsi, cci, macd, bb`

**`Series` class — PineScript-like operators**:
- Arithmetic: `add, sub, mul, div, mod, neg` — works with Series or numbers
- Comparison: `gt, gte, lt, lte, eq, neq` — returns 1/0 Series (boolean-like)
- Logical: `and, or, not` — combine conditions
- `offset(n)` — history access (like `close[1]` in PineScript)
- `materialize()` — break closure chains for memory efficiency
- `toArray()`, `toTimeValuePairs()`, `last()`, `get(index)`

**`BarData` class — auto cache invalidation**:
- Wraps bar arrays, tracks version changes
- `push(bar)` / `updateLast(bar)` increment version
- Series detects version change and recomputes automatically
- Perfect for streaming/real-time data updates

**Also available**: `LightweightChartsAdapter`, runtime (`setContext, clearContext, registerCalculate, recalculate, plot, hline`).

**Full indicator class system**: `indicator()` creates indicator constructors with metadata, inputs, calculate. `plot()` renders TimeValuePair[] on charts. `BarData` auto-invalidates cache for streaming. See `project-oakscriptjs-indicator-api.md` for details.

**Wrapper module**: `src/lib/oakscript/index.ts` — exports `oakSMA, oakEMA, oakRSI, oakATR, oakBB, closeSeries`

**Why:** oakscriptjs can implement the ENTIRE Turtle_Miura strategy as a readable script — no need for JS-native SignalEngine. The Series operators allow writing `close.gt(sma20).and(volume.gt(volumeSMA.mul(1.5)))` which reads like PineScript. The `indicator()` system makes indicators portable and configurable.

**How to apply:** Use oakscriptjs for ALL new indicator and strategy logic. Strategy indicators should be `indicator()` classes, not raw JS functions. Use `BarData` for streaming. `ta.crossover` and `ta.crossunder` are available for signal detection.
