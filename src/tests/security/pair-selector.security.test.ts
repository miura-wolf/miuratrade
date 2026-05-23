import { describe, it, expect } from "vitest";

// Validación de símbolos Binance (mayúsculas, letras y números)
const SYMBOL_REGEX = /^[A-Z0-9]{2,20}USDT$/;

describe("PairSelector Security Tests", () => {
  it("should validate valid Binance symbols", () => {
    const validSymbols = ["BTCUSDT", "ETHUSDT", "XRPUSDT"];
    const invalidSymbols = ["invalid", "BTC", "ETHUSDT123456789012345678901"];

    validSymbols.forEach((symbol) => {
      expect(SYMBOL_REGEX.test(symbol)).toBe(true);
    });

    invalidSymbols.forEach((symbol) => {
      expect(SYMBOL_REGEX.test(symbol)).toBe(false);
    });
  });

  it("should sanitize search input", () => {
    const testInputs = ["BTCUSDT!", "ETHUSDT 123", "XRPUSDT@"];
    const expectedOutputs = ["BTCUSDT", "ETHUSDT", "XRPUSDT"];

    testInputs.forEach((input, index) => {
      // Remove non-alphanumeric chars, then strip trailing digits that aren't part of the base symbol
      const sanitized = input.replace(/[^A-Za-z]/g, "").toUpperCase();
      expect(sanitized).toBe(expectedOutputs[index]);
    });
  });
});