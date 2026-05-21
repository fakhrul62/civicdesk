import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Lazy initialization — only connect when first used
let redis: Redis | null = null;

function hasRedisEnv() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis() {
  if (!hasRedisEnv()) {
    throw new Error("Upstash Redis environment variables are not configured");
  }

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
  if (!hasRedisEnv()) return null;

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
  if (!hasRedisEnv()) return null;

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
  if (!hasRedisEnv()) return null;

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
  if (hasRedisEnv()) {
    try {
      const r = getRedis();
      const cached = await r.get<T>(key);
      if (cached !== null) return cached;
    } catch (error) {
      console.warn(`Redis cache read unavailable for ${key}:`, error);
    }
  }

  const fresh = await fetcher();

  if (hasRedisEnv()) {
    try {
      const r = getRedis();
      await r.set(key, fresh, { ex: ttlSeconds });
    } catch (error) {
      console.warn(`Redis cache write unavailable for ${key}:`, error);
    }
  }

  return fresh;
}

/**
 * Invalidate cache by key or pattern
 */
export async function cacheInvalidate(key: string) {
  if (!hasRedisEnv()) return;

  try {
    const r = getRedis();
    await r.del(key);
  } catch (error) {
    console.warn(`Redis cache invalidation unavailable for ${key}:`, error);
  }
}
