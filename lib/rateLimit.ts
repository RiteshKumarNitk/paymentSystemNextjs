/**
 * Simple in-memory rate limiter.
 * Max `limit` requests per `windowMs` milliseconds per key (e.g. IP address).
 * NOTE: Resets on server restart. For multi-instance deployments, use Redis.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const LIMIT = 5;          // max requests per window

export function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= LIMIT) {
    return false;
  }

  entry.count += 1;
  return true;
}
