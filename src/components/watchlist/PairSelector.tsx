"use client";

import { useState, useMemo } from "react";
import { Search, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useScannerStore } from "@/lib/store/scanner-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Validación de símbolos Binance (mayúsculas, letras y números)
const SYMBOL_REGEX = /^[A-Z0-9]{2,20}USDT$/;

export function PairSelector() {
	const allPairs = useScannerStore((s) => s.allPairs);
	const selectedSymbols = useScannerStore((s) => s.selectedSymbols);
	const toggleSymbol = useScannerStore((s) => s.toggleSymbol);
	const selectAll = useScannerStore((s) => s.selectAll);
	const deselectAll = useScannerStore((s) => s.deselectAll);
	const selectTop = useScannerStore((s) => s.selectTop);

	const [search, setSearch] = useState("");
	const [expanded, setExpanded] = useState(false);

	// Validación de búsqueda segura
	const sanitizedSearch = useMemo(() => {
		if (!search) return "";
		// Solo permitir letras, números y espacios
		return search.replace(/[^A-Za-z0-9\s]/g, "").toUpperCase();
	}, [search]);

	const filtered = useMemo(() => {
		if (!sanitizedSearch) return allPairs;
		const q = sanitizedSearch;
		return allPairs.filter((p) => p.base.includes(q));
	}, [allPairs, sanitizedSearch]);

	return (
		<div className="flex flex-col border-b border-tv-border">
			{/* Header */}
			<button
				onClick={() => setExpanded(!expanded)}
				className="flex items-center justify-between px-3 py-2 hover:bg-tv-panel-hover"
			>
				<span className="text-[11px] font-semibold uppercase tracking-wider text-tv-text-muted">
					Pairs ({selectedSymbols.length}/{allPairs.length})
				</span>
				{expanded ? (
					<ChevronUp className="h-3.5 w-3.5 text-tv-text-muted" />
				) : (
					<ChevronDown className="h-3.5 w-3.5 text-tv-text-muted" />
				)}
			</button>

			{expanded && (
				<div className="flex flex-col gap-1.5 border-t border-tv-border px-3 py-2">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-tv-text-dim" />
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Buscar par..."
							className="w-full rounded border border-tv-border bg-tv-bg py-1 pl-7 pr-2 text-xs text-tv-text placeholder:text-tv-text-dim focus:border-tv-blue focus:outline-none"
							maxLength={20}
						/>
					</div>

					{/* Quick actions */}
					<div className="flex gap-1">
						<button
							onClick={selectAll}
							className="rounded bg-tv-bg px-2 py-0.5 text-[10px] text-tv-text-muted hover:bg-tv-panel-hover hover:text-tv-text"
						>
							Todos
						</button>
						<button
							onClick={deselectAll}
							className="rounded bg-tv-bg px-2 py-0.5 text-[10px] text-tv-text-muted hover:bg-tv-panel-hover hover:text-tv-text"
						>
							Ninguno
						</button>
						<button
							onClick={() => selectTop(50)}
							className="rounded bg-tv-bg px-2 py-0.5 text-[10px] text-tv-text-muted hover:bg-tv-panel-hover hover:text-tv-text"
						>
							Top 50
						</button>
						<button
							onClick={() => selectTop(100)}
							className="rounded bg-tv-bg px-2 py-0.5 text-[10px] text-tv-text-muted hover:bg-tv-panel-hover hover:text-tv-text"
						>
							Top 100
						</button>
					</div>

					{/* Pair list */}
					<ScrollArea className="h-60">
						<div className="flex flex-col">
							{filtered.map((p) => {
								const selected = selectedSymbols.includes(p.symbol);
								return (
									<button
										key={p.symbol}
										onClick={() => {
											// Validación adicional antes de toggle
											if (SYMBOL_REGEX.test(p.symbol)) {
												toggleSymbol(p.symbol);
											}
										}}
										className={cn(
											"flex items-center justify-between rounded px-2 py-1 text-xs transition-colors",
											selected
												? "bg-tv-blue/10 text-tv-text"
												: "text-tv-text-muted hover:bg-tv-panel-hover",
										)}
									>
										<div className="flex items-center gap-2">
											<div
												className={cn(
													"flex h-4 w-4 items-center justify-center rounded border",
													selected
														? "border-tv-blue bg-tv-blue text-white"
														: "border-tv-border",
												)}
											>
												{selected && <Check className="h-3 w-3" />}
											</div>
											<span className="font-medium">{p.base}</span>
										</div>
										<span className="tabular-nums text-tv-text-dim">
											${(p.volume / 1_000_000).toFixed(1)}M
										</span>
									</button>
								);
							})}
						</div>
					</ScrollArea>
				</div>
			)}
		</div>
	);
}
