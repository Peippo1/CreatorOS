import { createHash } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;
const RATE_LIMIT_MAX_REQUESTS = 10;
type RateLimitBucket = { count: number; resetAt: number };
const buckets = new Map<string, RateLimitBucket>();

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export async function checkGenerateRateLimit(request: Request, now = Date.now()): Promise<RateLimitResult> {
  const key = createHash("sha256").update(getClientIp(request)).digest("hex");
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await client.rpc("consume_generation_rate_limit", { bucket_key: key, window_seconds: RATE_LIMIT_WINDOW_SECONDS, max_requests: RATE_LIMIT_MAX_REQUESTS });
    if (!error && data?.[0]) return data[0].allowed ? { allowed: true } : { allowed: false, retryAfterSeconds: Math.max(1, data[0].retry_after_seconds) };
  }
  return checkMemoryRateLimit(key, now);
}

function checkMemoryRateLimit(key: string, now: number): RateLimitResult {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000 }); return { allowed: true }; }
  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  bucket.count += 1;
  return { allowed: true };
}

export function getClientIp(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown"; }
export function resetGenerateRateLimitForTests() { buckets.clear(); }
