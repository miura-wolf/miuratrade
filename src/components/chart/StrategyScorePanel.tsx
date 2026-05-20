"use client";

import type { ComponentScores, SignalState } from "@/lib/oakscript/indicators/turtle-miura";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
	score: number;
	state: SignalState;
	components: ComponentScores;
	details: {
		price: number;
		sma20: number;
		rsi: number;
		atr: number;
	};
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stateColor(state: SignalState): string {
	switch (state) {
		case "HIGH PRIORITY": return "bg-green-500";
		case "STRONG": return "bg-lime-500";
		case "WATCH": return "bg-yellow-500";
		case "WEAK": return "bg-orange-500";
		case "AVOID": return "bg-red-500";
	}
}

function stateTextColor(state: SignalState): string {
	switch (state) {
		case "HIGH PRIORITY": return "text-green-400";
		case "STRONG": return "text-lime-400";
		case "WATCH": return "text-yellow-400";
		case "WEAK": return "text-orange-400";
		case "AVOID": return "text-red-400";
	}
}

function stateBorderColor(state: SignalState): string {
	switch (state) {
		case "HIGH PRIORITY": return "border-green-500/30";
		case "STRONG": return "border-lime-500/30";
		case "WATCH": return "border-yellow-500/30";
		case "WEAK": return "border-orange-500/30";
		case "AVOID": return "border-red-500/30";
	}
}

function scoreBarColor(value: number, max: number): string {
	const pct = value / max;
	if (pct >= 0.8) return "bg-green-500";
	if (pct >= 0.6) return "bg-lime-500";
	if (pct >= 0.4) return "bg-yellow-500";
	if (pct >= 0.2) return "bg-orange-500";
	return "bg-red-500";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * StrategyScorePanel — floating panel showing Turtle_Miura score breakdown.
 * Renders a 0-100 score with component bars and signal state badge.
 */
export function StrategyScorePanel({ score, state, components, details }: Props) {
	return (
		<div className={`rounded-lg border bg-gray-900/95 p-3 shadow-2xl backdrop-blur-sm ${stateBorderColor(state)} border`}>
			{/* Header: Score + State badge */}
			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold text-gray-400">Turtle_Miura</span>
				</div>
				<span className={`rounded px-2 py-0.5 text-[10px] font-bold ${stateColor(state)} text-white`}>
					{state}
				</span>
			</div>

			{/* Big score number */}
			<div className="mb-3 flex items-baseline gap-2">
				<span className={`text-3xl font-bold tabular-nums ${stateTextColor(state)}`}>
					{score}
				</span>
				<span className="text-xs text-gray-500">/100</span>
			</div>

			{/* Component bars */}
			<div className="space-y-2">
				<ComponentBar label="Trend" value={components.trend} max={25} color="#3b82f6" />
				<ComponentBar label="Breakout" value={components.breakout} max={25} color="#f59e0b" />
				<ComponentBar label="Momentum" value={components.momentum} max={25} color="#a855f7" />
				<ComponentBar label="Volatility" value={components.volatility} max={25} color="#26a69a" />
			</div>

			{/* Detail values */}
			<div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-gray-800 pt-2 text-[10px]">
				<DetailRow label="SMA20" value={details.sma20.toFixed(2)} />
				<DetailRow label="RSI" value={details.rsi.toFixed(1)} />
				<DetailRow label="ATR" value={details.atr.toFixed(4)} />
				<DetailRow label="Price" value={details.price.toFixed(2)} />
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ComponentBar({
	label,
	value,
	max,
	color,
}: {
	label: string;
	value: number;
	max: number;
	color: string;
}) {
	const pct = Math.min(100, (value / max) * 100);

	return (
		<div className="flex items-center gap-2">
			<span className="w-[70px] text-[10px] text-gray-400">{label}</span>
			<div className="flex-1 overflow-hidden rounded-full bg-gray-800" style={{ height: 6 }}>
				<div
					className="h-full rounded-full transition-all duration-300"
					style={{ width: `${pct}%`, backgroundColor: color }}
				/>
			</div>
			<span className="w-8 text-right text-[10px] tabular-nums text-gray-300">
				{value.toFixed(0)}
			</span>
		</div>
	);
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-gray-500">{label}</span>
			<span className="tabular-nums text-gray-300">{value}</span>
		</div>
	);
}
