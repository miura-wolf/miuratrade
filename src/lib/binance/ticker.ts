const BASE = "/api/binance";

export interface BinanceTicker {
	symbol: string;
	priceChangePercent: string;
	lastPrice: string;
	quoteVolume: string; // USDT volume
}

/**
 * Fetch ALL USDT pairs from Binance 24hr ticker.
 * Returns sorted by volume descending.
 */
export async function fetchAllUSDTTickers(): Promise<
	Array<{
		symbol: string;
		base: string;
		price: number;
		change: number;
		volume: number;
	}>
> {
	const res = await fetch(`${BASE}/ticker/24hr`);
	if (!res.ok) throw new Error(`Binance API error: ${res.status}`);

	const data: BinanceTicker[] = await res.json();

	return data
		.filter((t) => t.symbol.endsWith("USDT"))
		.map((t) => ({
			symbol: t.symbol, // keep full symbol (e.g. "BTCUSDT")
			base: t.symbol.endsWith("USDT") ? t.symbol.slice(0, -4) : t.symbol,
			price: parseFloat(t.lastPrice),
			change: parseFloat(t.priceChangePercent),
			volume: parseFloat(t.quoteVolume),
		}))
		.filter((t) => t.volume > 0 && t.price > 0)
		.sort((a, b) => b.volume - a.volume);
}
