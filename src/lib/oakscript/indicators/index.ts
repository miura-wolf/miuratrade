// OakScriptJS Indicators — public stub
// Full indicator suite available in private fork
import type { IndicatorResult, BarData, Bar } from "oakscriptjs";

export type { SignalState } from "./turtle-miura";
export type { ComponentScores } from "./turtle-miura";
export type { TurtleMiuraOptions } from "./turtle-miura";
export type { TurtleMiuraResult } from "./turtle-miura";
export type { TrendOptions, TrendResult } from "./trend";
export type { BreakoutOptions, BreakoutResult } from "./breakout";
export type { MomentumOptions, MomentumResult } from "./momentum";
export type { VolatilityOptions, VolatilityResult } from "./volatility";
export type {
  RelativeStrengthOptions,
  RelativeStrengthResult,
} from "./relative-strength";

export { turtleMiuraIndicator } from "./turtle-miura";
export { trendIndicator } from "./trend";
export { breakoutIndicator } from "./breakout";
export { momentumIndicator } from "./momentum";
export { volatilityIndicator } from "./volatility";
export { relativeStrength, rankByRelativeStrength } from "./relative-strength";
