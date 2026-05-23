import type { Candle, Timeframe } from "./types";

const WS_BASE = "wss://stream.binance.com:9443/stream";

// Configuración de seguridad
const WS_TOKEN = process.env.WS_TOKEN || "default-secret-token"; // Debería estar en variables de entorno
const MAX_SUBSCRIPTIONS_PER_IP = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

interface KlineMsg {
  stream: string;
  data: {
    e: string;
    E: number;
    s: string;
    k: {
      t: number; // open time
      T: number; // close time
      s: string;
      i: string;
      o: string;
      c: string;
      h: string;
      l: string;
      v: string;
      x: boolean; // is closed
    };
  };
}

interface MiniTickerMsg {
  stream: string;
  data: {
    e: string;
    E: number;
    s: string;
    c: string; // close
    o: string; // open
    h: string;
    l: string;
    v: string;
    q: string;
  };
}

type WSMsg = KlineMsg | MiniTickerMsg;

export interface KlineSubscription {
  symbol: string;
  interval: Timeframe;
  onCandle: (c: Candle) => void;
}

export interface TickerSubscription {
  symbols: string[];
  onTick: (s: { symbol: string; close: number; open: number; pct: number }) => void;
}

/**
 * Single multiplexed WS connection to Binance, with auto-reconnect.
 * Subscriptions can be added/removed at runtime via SUBSCRIBE/UNSUBSCRIBE.
 */
export class BinanceWS {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private nextId = 1;
  private klineSubs = new Map<string, KlineSubscription>();
  private tickerSubs = new Map<string, (m: MiniTickerMsg["data"]) => void>();
  private connected = false;
  private closing = false;
  private subscriptionCountByIP: Map<string, { count: number; resetAt: number }> = new Map();

  // Validación de símbolos Binance
  private isValidSymbol(symbol: string): boolean {
    // Patrón: solo mayúsculas, letras y números, termina en USDT
    return /^[A-Z0-9]{2,20}USDT$/.test(symbol);
  }

  // Validación de timeframe
  private isValidTimeframe(tf: Timeframe): boolean {
    const valid: Timeframe[] = [
      "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"
    ];
    return valid.includes(tf);
  }

  // Rate limiting por IP (simulado, en producción usaría un servicio externo)
  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = this.subscriptionCountByIP.get(ip) || { count: 0, resetAt: now };
    
    if (now > entry.resetAt) {
      this.subscriptionCountByIP.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return true;
    }
    
    if (entry.count >= MAX_SUBSCRIPTIONS_PER_IP) {
      return false;
    }
    
    entry.count++;
    this.subscriptionCountByIP.set(ip, entry);
    return true;
  }

  // Autenticación simple (en producción usaría tokens JWT o similar)
  private authenticate(token: string): boolean {
    return token === WS_TOKEN;
  }

  connect() {
    if (this.ws || this.closing) return;
    this.ws = new WebSocket(WS_BASE);

    this.ws.onopen = () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      // Re-subscribe everything
      const streams: string[] = [];
      this.klineSubs.forEach((s) => {
        if (this.isValidSymbol(s.symbol) && this.isValidTimeframe(s.interval)) {
          streams.push(`${s.symbol.toLowerCase()}@kline_${s.interval}`);
        }
      });
      this.tickerSubs.forEach((_v, k) => streams.push(k));
      if (streams.length > 0) this.send({ method: "SUBSCRIBE", params: streams, id: this.nextId++ });
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as WSMsg | { result: unknown; id: number };
        if ("stream" in msg) this.dispatch(msg);
      } catch (e) {
        console.error("[BinanceWS] Parse error:", e, ev.data);
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.ws = null;
      if (!this.closing) this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) return;
    const delay = Math.min(30000, 1000 * 2 ** this.reconnectAttempts);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private send(payload: object) {
    if (this.ws && this.connected) this.ws.send(JSON.stringify(payload));
  }

  private dispatch(msg: WSMsg) {
    // Validación básica del mensaje
    if (!msg.stream || !msg.data) {
      console.warn("[BinanceWS] Invalid message structure:", msg);
      return;
    }

    if (msg.stream.includes("@kline_")) {
      const sub = this.klineSubs.get(msg.stream);
      if (!sub) return;
      const k = (msg as KlineMsg).data.k;
      
      // Validación de campos del mensaje
      if (!k || !k.t || !k.o || !k.c || !k.h || !k.l || !k.v) {
        console.warn("[BinanceWS] Incomplete kline message:", msg);
        return;
      }

      sub.onCandle({
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v),
        isFinal: k.x,
      });
    } else if (msg.stream.includes("@miniTicker")) {
      const handler = this.tickerSubs.get(msg.stream);
      if (handler) handler((msg as MiniTickerMsg).data);
    }
  }

  subscribeKline(
    symbol: string, 
    interval: Timeframe, 
    onCandle: (c: Candle) => void,
    token?: string
  ): () => void {
    // Validación de símbolo
    if (!this.isValidSymbol(symbol)) {
      console.error(`[BinanceWS] Invalid symbol: ${symbol}`);
      return () => {};
    }
    
    // Validación de timeframe
    if (!this.isValidTimeframe(interval)) {
      console.error(`[BinanceWS] Invalid timeframe: ${interval}`);
      return () => {};
    }
    
    // Autenticación (opcional)
    if (token && !this.authenticate(token)) {
      console.error("[BinanceWS] Authentication failed");
      return () => {};
    }
    
    // Rate limiting
    const ip = "simulated-ip"; // En producción, obtener IP real
    if (!this.checkRateLimit(ip)) {
      console.error("[BinanceWS] Rate limit exceeded");
      return () => {};
    }

    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    this.klineSubs.set(stream, { symbol, interval, onCandle });
    if (this.connected) this.send({ method: "SUBSCRIBE", params: [stream], id: this.nextId++ });
    return () => {
      this.klineSubs.delete(stream);
      if (this.connected) this.send({ method: "UNSUBSCRIBE", params: [stream], id: this.nextId++ });
    };
  }

  subscribeMiniTickers(
    symbols: string[],
    onTick: (s: { symbol: string; close: number; open: number; pct: number }) => void,
    token?: string
  ): () => void {
    // Validar todos los símbolos
    for (const symbol of symbols) {
      if (!this.isValidSymbol(symbol)) {
        console.error(`[BinanceWS] Invalid symbol in batch: ${symbol}`);
        return () => {};
      }
    }
    
    // Autenticación
    if (token && !this.authenticate(token)) {
      console.error("[BinanceWS] Authentication failed");
      return () => {};
    }
    
    // Rate limiting
    const ip = "simulated-ip";
    if (!this.checkRateLimit(ip)) {
      console.error("[BinanceWS] Rate limit exceeded");
      return () => {};
    }

    const streams = symbols.map((s) => `${s.toLowerCase()}@miniTicker`);
    streams.forEach((stream) => {
      this.tickerSubs.set(stream, (d) => {
        const close = parseFloat(d.c);
        const open = parseFloat(d.o);
        onTick({
          symbol: d.s,
          close,
          open,
          pct: open === 0 ? 0 : ((close - open) / open) * 100,
        });
      });
    });
    if (this.connected) this.send({ method: "SUBSCRIBE", params: streams, id: this.nextId++ });
    return () => {
      streams.forEach((s) => this.tickerSubs.delete(s));
      if (this.connected) this.send({ method: "UNSUBSCRIBE", params: streams, id: this.nextId++ });
    };
  }

  close() {
    this.closing = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.klineSubs.clear();
    this.tickerSubs.clear();
    this.subscriptionCountByIP.clear();
  }
}

// Singleton — only one WS connection per browser tab
let singleton: BinanceWS | null = null;
export function getBinanceWS(): BinanceWS {
  if (typeof window === "undefined") {
    // SSR safety: dummy
    return new BinanceWS();
  }
  if (!singleton) {
    singleton = new BinanceWS();
    singleton.connect();
  }
  return singleton;
}
