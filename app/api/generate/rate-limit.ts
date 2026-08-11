import { createHash } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;
const RATE_LIMIT_MAX_REQUESTS = 10;
const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
const LOGIN_RATE_LIMIT_MAX_REQUESTS = 10;
type RateLimitBucket = { count: number; resetAt: number };
const buckets = new Map<string, RateLimitBucket>();

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export async function checkGenerateRateLimit(request: Request, userId?: string, now = Date.now()): Promise<RateLimitResult> {
  return checkRateLimit(`generate:${userId ?? getClientIp(request)}`, RATE_LIMIT_WINDOW_SECONDS, RATE_LIMIT_MAX_REQUESTS, now);
}

export async function checkLoginRateLimit(request: Request, now = Date.now()): Promise<RateLimitResult> {
  // Version the bucket so a previously exhausted beta bucket does not keep
  // locking users out after the production limit is corrected.
  return checkRateLimit(`login:v2:${getClientIp(request)}`, LOGIN_RATE_LIMIT_WINDOW_SECONDS, LOGIN_RATE_LIMIT_MAX_REQUESTS, now);
}

async function checkRateLimit(identifier: string, windowSeconds: number, maxRequests: number, now: number): Promise<RateLimitResult> {
  const key = createHash("sha256").update(identifier).digest("hex");
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await client.rpc("consume_generation_rate_limit", { bucket_key: key, window_seconds: windowSeconds, max_requests: maxRequests });
    if (!error && data?.[0]) return data[0].allowed ? { allowed: true } : { allowed: false, retryAfterSeconds: Math.max(1, data[0].retry_after_seconds) };

    // In production, do not fall back to a per-instance counter if the shared
    // limit is unavailable; that could turn a database fault into OpenAI abuse.
    if (process.env.NODE_ENV === "production") return { allowed: false, retryAfterSeconds: 60 };
  }
  return checkMemoryRateLimit(key, now, windowSeconds, maxRequests);
}

function checkMemoryRateLimit(key: string, now: number, windowSeconds: number, maxRequests: number): RateLimitResult {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 }); return { allowed: true }; }
  if (bucket.count >= maxRequests) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  bucket.count += 1;
  return { allowed: true };
}

export function getClientIp(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown"; }
export function resetGenerateRateLimitForTests() { buckets.clear(); }
