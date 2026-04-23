export type RateLimitDriver = "memory" | "redis";

interface RateLimitConfig {
  driver: RateLimitDriver;
  redisUrl?: string;
  redisToken?: string;
}

export function getRateLimitConfig(): RateLimitConfig {
  const driver = (import.meta.env.RATE_LIMIT_DRIVER as RateLimitDriver | undefined) ?? "memory";
  const redisUrl = import.meta.env.UPSTASH_REDIS_REST_URL as string | undefined;
  const redisToken = import.meta.env.UPSTASH_REDIS_REST_TOKEN as string | undefined;

  return {
    driver,
    redisUrl,
    redisToken,
  };
}

export function isRedisConfigured(config: RateLimitConfig): boolean {
  return Boolean(config.redisUrl && config.redisToken);
}
