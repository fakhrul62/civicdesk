import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Lazy initialization — only connect when first used
let redis: Redis | null = null;

function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

/**
 * Rate limiter for complaint submissions.
 * Allows 5 submissions per hour per IP address.
 */
export function getSubmissionLimiter() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "civicdesk:submit",
    analytics: true,
  });
}

/**
 * Rate limiter for login attempts.
 * Allows 10 attempts per 15 minutes per IP address.
 */
export function getLoginLimiter() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(10, "15 m"),
    prefix: "civicdesk:login",
    analytics: true,
  });
}

/**
 * Rate limiter for API endpoints.
 * Allows 100 requests per minute per IP address.
 */
export function getApiLimiter() {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    prefix: "civicdesk:api",
    analytics: true,
  });
}

/**
 * Cache helper — get or set with TTL
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  const r = getRedis();
  const cached = await r.get<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  await r.set(key, fresh, { ex: ttlSeconds });
  return fresh;
}

/**
 * Invalidate cache by key or pattern
 */
export async function cacheInvalidate(key: string) {
  const r = getRedis();
  await r.del(key);
}
