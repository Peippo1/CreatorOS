const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export type RateLimitResult =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      retryAfterSeconds: number;
    };

export function checkGenerateRateLimit(
  request: Request,
  now = Date.now(),
): RateLimitResult {
  const ip = getClientIp(request);
  const bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return { allowed: true };
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    firstForwardedIp ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function resetGenerateRateLimitForTests() {
  buckets.clear();
}
