import { NextRequest, NextResponse } from "next/server";

const BINANCE_BASE = "https://api.binance.com/api/v3";

// Whitelist estricta de endpoints permitidos y sus parámetros
const ALLOWED_ENDPOINTS: Record<string, string[]> = {
  "/klines": ["symbol", "interval", "limit", "startTime", "endTime"],
  "/ticker/24hr": ["symbol", "symbols"],
  "/ticker/price": ["symbol"],
  "/ticker/bookTicker": ["symbol"],
  "/exchangeInfo": ["symbol"],
};

// Validación de símbolos Binance (mayúsculas, letras y números)
const SYMBOL_REGEX = /^[A-Z0-9]{2,20}$/;
// Validación de intervalos de tiempo
const VALID_INTERVALS = [
  "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M",
];
// Máximo de símbolos permitidos en consultas batch
const MAX_SYMBOLS_BATCH = 50;
// Límite máximo de velas
const MAX_LIMIT = 1000;

// Rate limiting simple (en memoria, por entorno)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100;  // 100 requests/min

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  entry.count++;
  return true;
}

function validateSymbol(symbol: string): boolean {
  return SYMBOL_REGEX.test(symbol);
}

function validateKlineParams(params: URLSearchParams): Record<string, string> | null {
  const validated: Record<string, string> = {};
  
  const symbol = params.get("symbol");
  if (!symbol || !validateSymbol(symbol)) return null;
  validated.symbol = symbol;
  
  const interval = params.get("interval");
  if (!interval || !VALID_INTERVALS.includes(interval)) return null;
  validated.interval = interval;
  
  const limit = params.get("limit");
  if (limit) {
    const n = parseInt(limit, 10);
    if (isNaN(n) || n < 1 || n > MAX_LIMIT) return null;
    validated.limit = String(n);
  }
  
  const startTime = params.get("startTime");
  if (startTime) {
    const n = parseInt(startTime, 10);
    if (isNaN(n) || n < 0) return null;
    validated.startTime = String(n);
  }
  
  const endTime = params.get("endTime");
  if (endTime) {
    const n = parseInt(endTime, 10);
    if (isNaN(n) || n < 0) return null;
    validated.endTime = String(n);
  }
  
  return validated;
}

function validateTickerParams(params: URLSearchParams): Record<string, string> | null {
  const validated: Record<string, string> = {};
  
  const symbol = params.get("symbol");
  if (symbol) {
    if (!validateSymbol(symbol)) return null;
    validated.symbol = symbol;
  }
  
  const symbols = params.get("symbols");
  if (symbols) {
    try {
      const parsed = JSON.parse(symbols) as string[];
      if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > MAX_SYMBOLS_BATCH) return null;
      for (const s of parsed) {
        if (!validateSymbol(s)) return null;
      }
      validated.symbols = symbols;
    } catch {
      return null;
    }
  }
  
  return validated;
}

const VALIDATORS: Record<string, (params: URLSearchParams) => Record<string, string> | null> = {
  "/klines": validateKlineParams,
  "/ticker/24hr": validateTickerParams,
  "/ticker/price": (p) => {
    const symbol = p.get("symbol");
    if (!symbol || !validateSymbol(symbol)) return null;
    return { symbol };
  },
  "/ticker/bookTicker": (p) => {
    const symbol = p.get("symbol");
    if (!symbol || !validateSymbol(symbol)) return null;
    return { symbol };
  },
  "/exchangeInfo": () => ({}),
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const path = request.nextUrl.pathname.replace("/api/binance", "");

  // --- 1. Rate limiting ---
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
      { status: 429 },
    );
  }

  // --- 2. Validación estricta de endpoint ---
  const allowedParams = ALLOWED_ENDPOINTS[path];
  if (!allowedParams) {
    return NextResponse.json({ error: "Endpoint no permitido" }, { status: 403 });
  }

  // --- 3. Validación de parámetros específica por endpoint ---
  const validator = VALIDATORS[path];
  if (validator) {
    const validatedParams = validator(searchParams);
    if (!validatedParams) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }
    
    // Construir URL solo con parámetros validados
    const url = new URL(`${BINANCE_BASE}${path}`);
    for (const [key, value] of Object.entries(validatedParams)) {
      url.searchParams.set(key, value);
    }

    try {
      const res = await fetch(url.toString(), {
        headers: { "User-Agent": "MiuraTrade/1.0" },
        next: { revalidate: path === "/exchangeInfo" ? 3600 : 5 },
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Error de API externa` },
          { status: res.status },
        );
      }

      const data = await res.json();
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": path === "/exchangeInfo" 
            ? "public, s-maxage=3600, stale-while-revalidate=86400"
            : "public, s-maxage=5, stale-while-revalidate=10",
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Binance Proxy]", error);
      }
      return NextResponse.json(
        { error: "Error al conectar con Binance API" },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ error: "Endpoint no soportado" }, { status: 403 });
}
