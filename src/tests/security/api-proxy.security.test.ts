import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock fetch for testing
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("Binance API Proxy Security Tests", () => {
  let request: NextRequest;
  let response: NextResponse;

  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch.mockReset();
    request = new NextRequest("http://localhost:3000/api/binance/klines?symbol=BTCUSDT&interval=1m");
  });

  it("should reject invalid endpoints", async () => {
    request = new NextRequest("http://localhost:3000/api/binance/invalid");
    const { GET } = await import("../../app/api/binance/[...path]/route.ts");
    response = await GET(request);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Endpoint no permitido" });
  });

  it("should reject invalid symbols", async () => {
    request = new NextRequest("http://localhost:3000/api/binance/klines?symbol=invalid_symbol&interval=1m");
    const { GET } = await import("../../app/api/binance/[...path]/route.ts");
    response = await GET(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Parámetros inválidos" });
  });

  it("should reject invalid intervals", async () => {
    request = new NextRequest("http://localhost:3000/api/binance/klines?symbol=BTCUSDT&interval=invalid");
    const { GET } = await import("../../app/api/binance/[...path]/route.ts");
    response = await GET(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Parámetros inválidos" });
  });

  it("should reject invalid limits", async () => {
    request = new NextRequest("http://localhost:3000/api/binance/klines?symbol=BTCUSDT&interval=1m&limit=0");
    const { GET } = await import("../../app/api/binance/[...path]/route.ts");
    response = await GET(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Parámetros inválidos" });
  });

  it("should enforce rate limiting", async () => {
    const ip = "192.168.1.1";
    request.headers.set("x-forwarded-for", ip);
    for (let i = 0; i < 100; i++) {
      const { GET } = await import("../../app/api/binance/[...path]/route.ts");
      response = await GET(request);
      expect(response.status).toBe(200);
    }
    const { GET } = await import("../../app/api/binance/[...path]/route.ts");
    response = await GET(request);
    expect(response.status).toBe(429);
  });

  it("should validate batch symbols", async () => {
    const symbols = JSON.stringify(["BTCUSDT", "ETHUSDT", "INVALID"]);
    request = new NextRequest("http://localhost:3000/api/binance/ticker/24hr?symbols=" + symbols);
    const { GET } = await import("../../app/api/binance/[...path]/route.ts");
    response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("should allow valid requests", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ test: "data" }),
    });
    const { GET } = await import("../../app/api/binance/[...path]/route.ts");
    response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ test: "data" });
  });
});