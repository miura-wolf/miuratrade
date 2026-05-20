"use client";

import type { SignalState } from "@/lib/oakscript/indicators/turtle-miura";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
	score: number;
	state: SignalState;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stateConfig(state: SignalState) {
	switch (state) {
		case "HIGH PRIORITY":
			return { bg: "bg-green-500", text: "text-white", dot: "bg-green-300" };
		case "STRONG":
			return { bg: "bg-lime-600", text: "text-white", dot: "bg-lime-300" };
		case "WATCH":
			return { bg: "bg-yellow-600", text: "text-white", dot: "bg-yellow-300" };
		case "WEAK":
			return { bg: "bg-orange-600", text: "text-white", dot: "bg-orange-300" };
		case "AVOID":
			return { bg: "bg-red-600", text: "text-white", dot: "bg-red-300" };
	}
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * StrategyScoreBadge — inline badge for chart overlay showing current strategy state.
 * Compact: colored dot + score number + state label.
 */
export function StrategyScoreBadge({ score, state }: Props) {
	const cfg = stateConfig(state);

	return (
		<div className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 ${cfg.bg} ${cfg.text} text-[10px] font-bold shadow-sm`}>
			<span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} animate-pulse`} />
			<span className="tabular-nums">{score}</span>
			<span className="opacity-80">{state}</span>
		</div>
	);
}
