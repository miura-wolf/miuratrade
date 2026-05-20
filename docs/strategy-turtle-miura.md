# /docs/strategy-turtle-miura.md

```md
# Turtle_Miura Strategy

# Strategy Purpose

The Turtle_Miura strategy exists to identify:

- strong directional momentum
- volatility expansion
- breakout structures
- continuation opportunities

on Binance Spot pairs.

---

# Core Philosophy

Trade strength.
Do not predict.

Miura prioritizes:
- momentum
- trend continuation
- market participation
- relative strength

---

# Strategy Components

## 1. Trend Detection

Conditions:
- price above SMA20
- SMA20 rising
- higher highs
- higher lows

Signal:
- TRENDING

---

## 2. Breakout Detection

Conditions:
- break previous range high
- volume expansion
- candle body strength

Signal:
- BREAKOUT

---

## 3. Momentum Confirmation

Conditions:
- strong candle closes
- increasing participation
- volatility expansion

Signal quality increases.

---

## 4. Volatility Filter

Avoid:
- dead markets
- compressed low-volume structures
- weak momentum

Signal:
- AVOID

---

## 5. Relative Strength

Pairs are ranked by:
- momentum quality
- breakout quality
- volatility
- trend structure
- volume participation

---

# Scanner Output

Each pair receives:

```txt
Signal Score: 0-100
Trend State
Momentum State
Breakout State
Volume State
```

---

# Example Signal States

```txt
95-100 → HIGH PRIORITY
80-94  → STRONG
65-79  → WATCH
40-64  → WEAK
0-39   → AVOID
```

---

# Watchlist Purpose

The watchlist should answer:

> What deserves attention RIGHT NOW?

NOT:
- show random market noise
- show all possible metrics

---

# Initial Indicators

Allowed V1 indicators:
- SMA20
- Volume
- Breakout levels
- ATR (optional)

Avoid indicator overload.

---

# Execution Philosophy

Miura V1 is:
- semi-manual
- trader-assisted

NOT:
- fully automated

The user decides execution.

---

# Future Evolution

Future versions may include:
- futures
- automation
- alerts
- AI-assisted ranking

But NOT in V1.
```

---