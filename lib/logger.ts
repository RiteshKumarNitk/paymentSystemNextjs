import pino from "pino";

/**
 * Structured logger using Pino.
 * - In development: pretty-prints with colours via pino-pretty
 * - In production: outputs structured JSON suitable for log aggregators
 *   (Datadog, Loki, CloudWatch, etc.)
 */
const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    base: {
      env: process.env.NODE_ENV,
      app: "eventpass",
    },
  },
  process.env.NODE_ENV !== "production"
    ? pino.transport({
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" },
      })
    : undefined
);

export default logger;
