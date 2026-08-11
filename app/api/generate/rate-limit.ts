import { createHash } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;
const RATE_LIMIT_MAX_REQUESTS = 10;
const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
const LOGIN_RATE_LIMIT_MAX_REQUESTS = 10;

type RateLimitBucket = { count: number; resetAt: number };
const buckets = new Map<string, RateLimitBucket>();

export type RateLimitOutcome =
  | { outcome: "allowed"; source: "shared" | "memory" }
  | { outcome: "limited"; retryAfterSeconds: number }
  | { outcome: "unavailable" };

type RateLimitCategory = "generate" | "login";

export async function checkGenerateRateLimit(
  request: Request,
  userId?: string,
  now = Date.now(),
  requestId = crypto.randomUUID(),
): Promise<RateLimitOutcome> {
  return checkRateLimit(
    `generate:${userId ?? getClientIp(request)}`,
    RATE_LIMIT_WINDOW_SECONDS,
    RATE_LIMIT_MAX_REQUESTS,
    "generate",
    requestId,
    now,
  );
}

export async function checkLoginRateLimit(
  request: Request,
  now = Date.now(),
  requestId = crypto.randomUUID(),
): Promise<RateLimitOutcome> {
  return checkRateLimit(
    `login:v2:${getClientIp(request)}`,
    LOGIN_RATE_LIMIT_WINDOW_SECONDS,
    LOGIN_RATE_LIMIT_MAX_REQUESTS,
    "login",
    requestId,
    now,
  );
}

async function checkRateLimit(
  identifier: string,
  windowSeconds: number,
  maxRequests: number,
  category: RateLimitCategory,
  requestId: string,
  now: number,
): Promise<RateLimitOutcome> {
  const key = createHash("sha256").update(identifier).digest("hex");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return unavailableOrMemory(key, windowSeconds, maxRequests, category, requestId, now);
  }

  try {
    const client = createClient(url, serviceRoleKey);
    const { data, error } = await client.rpc("consume_generation_rate_limit", {
      bucket_key: key,
      window_seconds: windowSeconds,
      max_requests: maxRequests,
    });

    if (error) {
      return unavailableOrMemory(key, windowSeconds, maxRequests, category, requestId, now);
    }

    const outcome = parseRpcOutcome(data);
    if (!outcome) {
      return unavailableOrMemory(key, windowSeconds, maxRequests, category, requestId, now);
    }

    logRateLimitOutcome(requestId, category, outcome);
    return outcome;
  } catch {
    return unavailableOrMemory(key, windowSeconds, maxRequests, category, requestId, now);
  }
}

function parseRpcOutcome(data: unknown): RateLimitOutcome | null {
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object" || data[0] === null) {
    return null;
  }

  const row = data[0] as { allowed?: unknown; retry_after_seconds?: unknown };
  if (row.allowed === true) return { outcome: "allowed", source: "shared" };
  if (row.allowed !== false) return null;

  const retryAfterSeconds = Number(row.retry_after_seconds);
  if (!Number.isFinite(retryAfterSeconds) || retryAfterSeconds < 1) return null;

  return { outcome: "limited", retryAfterSeconds: Math.ceil(retryAfterSeconds) };
}

function unavailableOrMemory(
  key: string,
  windowSeconds: number,
  maxRequests: number,
  category: RateLimitCategory,
  requestId: string,
  now: number,
): RateLimitOutcome {
  if (process.env.NODE_ENV === "production") {
    const outcome: RateLimitOutcome = { outcome: "unavailable" };
    logRateLimitOutcome(requestId, category, outcome);
    return outcome;
  }

  const outcome = checkMemoryRateLimit(key, now, windowSeconds, maxRequests);
  logRateLimitOutcome(requestId, category, outcome);
  return outcome;
}

function checkMemoryRateLimit(key: string, now: number, windowSeconds: number, maxRequests: number): RateLimitOutcome {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { outcome: "allowed", source: "memory" };
  }

  if (bucket.count >= maxRequests) {
    return {
      outcome: "limited",
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { outcome: "allowed", source: "memory" };
}

function logRateLimitOutcome(requestId: string, category: RateLimitCategory, result: RateLimitOutcome) {
  if (process.env.NODE_ENV === "test") return;
  const level = result.outcome === "unavailable" ? "warn" : "info";
  console[level === "warn" ? "warn" : "info"]("CreatorOS rate limit", {
    requestId,
    category,
    outcome: result.outcome,
  });
}

export function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}

export function resetGenerateRateLimitForTests() {
  buckets.clear();
}
