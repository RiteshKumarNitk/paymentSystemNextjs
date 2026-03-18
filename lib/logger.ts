import pino from "pino";

/**
 * Structured logger using Pino.
 * - In development: pretty-prints with colours via pino-pretty
 * - In production: outputs structured JSON suitable for log aggregators
 *   (Datadog, Loki, CloudWatch, etc.)
 */
const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: {
    env: process.env.NODE_ENV,
    app: "eventpass",
  },
});

export default logger;
