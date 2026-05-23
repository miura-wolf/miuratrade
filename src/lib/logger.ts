/**
 * Simple logger utility with levels.
 * In production you may replace this with a more robust logger (pino, winston, etc.).
 */
export const logger = {
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[INFO]", ...args);
    }
  },
  warn: (...args: unknown[]) => {
    console.warn("[WARN]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[ERROR]", ...args);
  },
};
