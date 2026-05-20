import { NextRequest, NextResponse } from "next/server";

const BINANCE_BASE = "https://api.binance.com/api/v3";

/**
 * Proxy route for Binance API.
 * Usage: /api/binance/klines?symbol=BTCUSDT&interval=1h&limit=100
 * Usage: /api/binance/ticker/24hr?symbol=BTCUSDT
 * Usage: /api/binance/ticker/24hr (all tickers)
 */
export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;

	// Build the Binance URL from the remaining path
	const path = request.nextUrl.pathname.replace("/api/binance", "");
	const url = new URL(`${BINANCE_BASE}${path}`);

	// Forward all query params
	searchParams.forEach((value, key) => {
		url.searchParams.set(key, value);
	});

	try {
		const res = await fetch(url.toString(), {
			headers: { "User-Agent": "MiuraTrade/1.0" },
		});

		if (!res.ok) {
			return NextResponse.json(
				{ error: `Binance API error: ${res.status}` },
				{ status: res.status },
			);
		}

		const data = await res.json();

		return NextResponse.json(data, {
			headers: {
				"Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
			},
		});
	} catch (error) {
		console.error("[Binance Proxy]", error);
		return NextResponse.json(
			{ error: "Failed to reach Binance API" },
			{ status: 502 },
		);
	}
}
