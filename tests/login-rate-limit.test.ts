import { afterEach, describe, expect, it } from "vitest";

import {
  checkLoginRateLimit,
  resetGenerateRateLimitForTests,
} from "@/app/api/generate/rate-limit";

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  resetGenerateRateLimitForTests();
  if (originalSupabaseUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  if (originalServiceRoleKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env["NODE_ENV"] = originalNodeEnv;
});

describe("login rate limit", () => {
  it("allows ten valid attempts before returning a retry window", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env["NODE_ENV"] = "test";

    const request = new Request("https://creator.example/login", {
      headers: { "x-forwarded-for": "203.0.113.10" },
    });

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await expect(checkLoginRateLimit(request, 1_000)).resolves.toEqual({ allowed: true });
    }

    await expect(checkLoginRateLimit(request, 1_000)).resolves.toMatchObject({
      allowed: false,
      retryAfterSeconds: expect.any(Number),
    });
  });

  it("does not share a login allowance across client IPs", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.NODE_ENV = "test";

    const firstClient = new Request("https://creator.example/login", {
      headers: { "x-forwarded-for": "203.0.113.11" },
    });
    const secondClient = new Request("https://creator.example/login", {
      headers: { "x-forwarded-for": "203.0.113.12" },
    });

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await checkLoginRateLimit(firstClient, 1_000);
    }

    await expect(checkLoginRateLimit(secondClient, 1_000)).resolves.toEqual({ allowed: true });
  });
});
