import { createHash } from "node:crypto";
import { getRateLimitConfig, isRedisConfigured } from "./rate-limit.config";
import { checkRedisRateLimit } from "./redis-rate-limit";

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

type RateLimitStore = Map<string, RateLimitEntry>;

declare global {
  // eslint-disable-next-line no-var
  var __raveomatRateLimitStore: RateLimitStore | undefined;
  // eslint-disable-next-line no-var
  var __raveomatRateLimitLastPruneAt: number | undefined;
}

const store: RateLimitStore = globalThis.__raveomatRateLimitStore ?? new Map<string, RateLimitEntry>();
globalThis.__raveomatRateLimitStore = store;

const rateLimitConfig = getRateLimitConfig();

if (rateLimitConfig.driver === "redis" && !isRedisConfigured(rateLimitConfig)) {
  console.warn("RATE_LIMIT_DRIVER=redis set, but Redis credentials are missing. Falling back to in-memory store.");
}

function pruneExpiredEntries(now: number): void {
  const lastPruneAt = globalThis.__raveomatRateLimitLastPruneAt ?? 0;
  const shouldPrune = now - lastPruneAt >= 60_000;

  if (!shouldPrune) return;

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }

  globalThis.__raveomatRateLimitLastPruneAt = now;
}

export function hashIdentifier(rawValue: string): string {
  return createHash("sha256").update(rawValue).digest("hex").slice(0, 24);
}

export type { RateLimitDecision };

function checkMemoryRateLimit(
  bucket: string,
  identity: string,
  options: RateLimitOptions
): RateLimitDecision {
  const now = Date.now();
  pruneExpiredEntries(now);

  const key = `${bucket}:${identity}`;
  const currentEntry = store.get(key);

  if (!currentEntry || currentEntry.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, options.maxRequests - 1),
      retryAfterSeconds: 0,
    };
  }

  if (currentEntry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((currentEntry.resetAt - now) / 1000)),
    };
  }

  currentEntry.count += 1;
  store.set(key, currentEntry);

  return {
    allowed: true,
    remaining: Math.max(0, options.maxRequests - currentEntry.count),
    retryAfterSeconds: 0,
  };
}

export async function checkRateLimit(
  bucket: string,
  identity: string,
  options: RateLimitOptions
): Promise<RateLimitDecision> {
  if (rateLimitConfig.driver === "redis" && isRedisConfigured(rateLimitConfig)) {
    const key = `${bucket}:${identity}`;
    const redisDecision = await checkRedisRateLimit(key, options.maxRequests, options.windowMs);
    if (redisDecision) return redisDecision;
  }

  return checkMemoryRateLimit(bucket, identity, options);
}

export function getClientIp(headers: Headers, fallbackAddress?: string): string {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();

  if (forwardedFor) return forwardedFor;
  if (realIp) return realIp;
  return fallbackAddress?.trim() || "unknown";
}
