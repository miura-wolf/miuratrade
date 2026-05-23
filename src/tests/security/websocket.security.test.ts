import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBinanceWS } from "../../lib/binance/ws";

// Mock WebSocket globally
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = 1;
  constructor(public url: string) {
    MockWebSocket.instances.push(this);
    setTimeout(() => this.onopen && this.onopen(), 0);
  }
  send(payload: string) {
    // Echo back a fake kline message for testing
    const msg = JSON.parse(payload);
    if (msg.method === "SUBSCRIBE" && msg.params[0].includes("@kline_")) {
      const stream = msg.params[0];
      const fake = {
        stream,
        data: {
          e: "kline",
          E: Date.now(),
          s: "BTCUSDT",
          k: {
            t: Date.now(),
            T: Date.now() + 60000,
            s: "BTCUSDT",
            i: "1m",
            o: "50000",
            c: "50010",
            h: "50020",
            l: "49990",
            v: "1",
            x: true,
          },
        },
      };
      setTimeout(() => this.onmessage && this.onmessage({ data: JSON.stringify(fake) }), 0);
    }
  }
  close() {
    this.readyState = 3;
    this.onclose && this.onclose();
  }
}

globalThis.WebSocket = MockWebSocket as any;

describe("BinanceWS Security Tests", () => {
  let ws = getBinanceWS();
  beforeEach(() => {
    // reset singleton state
    ws.close();
    ws = getBinanceWS();
    vi.restoreAllMocks();
  });

  it("should reject invalid symbol subscription", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const unsubscribe = ws.subscribeKline("invalid", "1m", () => {}, "wrong-token");
    expect(consoleSpy).toHaveBeenCalled();
    unsubscribe();
  });

  it("should accept valid subscription and receive candle", (done) => {
    const onCandle = vi.fn();
    ws.subscribeKline("BTCUSDT", "1m", onCandle);
    setTimeout(() => {
      expect(onCandle).toHaveBeenCalled();
      done();
    }, 10);
  });
});