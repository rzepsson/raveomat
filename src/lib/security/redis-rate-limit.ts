import { getRateLimitConfig, isRedisConfigured } from "./rate-limit.config";
import type { RateLimitDecision } from "./rate-limit";

const LUA_FIXED_WINDOW = [
  "local count = redis.call('INCR', KEYS[1])",
  "if count == 1 then",
  "  redis.call('EXPIRE', KEYS[1], ARGV[1])",
  "end",
  "return count",
].join(" ");

async function redisEval(
  keys: string[],
  args: string[]
): Promise<number | null> {
  const config = getRateLimitConfig();
  if (!isRedisConfigured(config)) return null;

  try {
    const response = await fetch(config.redisUrl!, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.redisToken!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["EVAL", LUA_FIXED_WINDOW, String(keys.length), ...keys, ...args]),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return typeof data.result === "number" ? data.result : null;
  } catch {
    console.error("Redis rate limit error, falling back to in-memory");
    return null;
  }
}

export async function checkRedisRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitDecision | null> {
  const config = getRateLimitConfig();
  if (config.driver !== "redis" || !isRedisConfigured(config)) return null;

  const windowSeconds = Math.ceil(windowMs / 1000);
  const count = await redisEval([key], [String(windowSeconds)]);

  if (count === null) return null;

  const allowed = count <= maxRequests;
  const remaining = Math.max(0, maxRequests - count);

  return {
    allowed,
    remaining,
    retryAfterSeconds: allowed ? 0 : windowSeconds,
  };
}
