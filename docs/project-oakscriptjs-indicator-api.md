---
name: oakscriptJS indicator system API
description: oakscriptJS has indicator(), plot(), BarData, input() for creating proper indicator classes — not just ta functions
type: project
---

oakscriptJS has a full indicator class system beyond just `ta.*` functions:

**`indicator(metadata, setup)`** — Creates indicator constructors (like PineScript indicator() function):
- `metadata`: `{ title, shortTitle?, overlay?, format?, precision? }`
- `setup(ctx)`: receives `IndicatorContext` with OHLCV arrays, paneIndex
- Returns a class with `calculate(data)`, `getInputs()`, `updateInputs()`, `isOverlay()`, `getPaneIndex()`

**`plot(values, times, options?)`** — Creates TimeValuePair[] for chart rendering:
- `options`: `{ color?, title?, lineWidth?, lineStyle?: 'solid'|'dashed'|'dotted', offset? }`
- `createPlot(id, values, times, options?)` — returns PlotResult with id + data + options

**`input` definitions**: `{ name, type: 'int'|'float'|'source'|'bool'|'string', title, defaultValue, min?, max?, step?, options? }` — like PineScript `input.int()`, `input.float()`, etc.

**`BarData`** — Wraps bar arrays for streaming:
- `BarData.from(bars)` — create wrapper
- `push(bar)` / `updateLast(bar)` — increment version
- Series detects version change and recomputes automatically

**Why:** This is the correct way to implement Turtle_Miura indicators. Instead of JS functions in `src/lib/indicators/index.ts`, indicators should be proper oakscriptJS indicator classes with configurable inputs and automatic cache invalidation for live data.

**How to apply:** When implementing strategy indicators (Trend, Breakout, Momentum, Volatility, Relative Strength), use `indicator()` to create them as classes. Use `plot()` for rendering. Use `BarData` for streaming. This makes indicators portable, configurable, and compatible with the oakscriptJS ecosystem.
