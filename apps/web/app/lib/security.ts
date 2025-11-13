// lib/security.ts

// Simple input caps you can reuse elsewhere
export const inputCaps = { maxQueryLen: 512 };

// In-memory IP buckets (per runtime instance)
// Note: resets on server restarts or across serverless instances
type Bucket = { count: number; ts: number };
const ipBuckets = new Map<string, Bucket>();

/**
 * Fixed-window rate limiter
 * @param ip       Client IP string (required)
 * @param limit    Max requests allowed in the window (default 60)
 * @param windowMs Window size in ms (default 60_000 = 1 minute)
 * @returns true if allowed, false if blocked
 */
export function rateLimit(ip: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = ipBuckets.get(ip) ?? { count: 0, ts: now };

  // Reset window if expired
  if (now - bucket.ts > windowMs) {
    bucket.count = 0;
    bucket.ts = now;
  }

  bucket.count += 1;
  ipBuckets.set(ip, bucket);

  // Light cleanup: occasionally drop very old buckets
  if (ipBuckets.size > 10_000 && Math.random() < 0.001) {
    const cutoff = now - windowMs * 2;
    for (const [key, b] of ipBuckets) if (b.ts < cutoff) ipBuckets.delete(key);
  }

  return bucket.count <= limit;
}

/**
 * Optional helper: enforce a maximum query length
 */
export function isTooLong(input: string, max = inputCaps.maxQueryLen): boolean {
  return (input?.length ?? 0) > max;
}