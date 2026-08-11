import { afterEach, describe, expect, it, vi } from "vitest";

const rpc = vi.hoisted(() => vi.fn());
const createClient = vi.hoisted(() => vi.fn(() => ({ rpc })));

vi.mock("@supabase/supabase-js", () => ({ createClient }));

import {
  checkGenerateRateLimit,
  resetGenerateRateLimitForTests,
} from "@/app/api/generate/rate-limit";

const environmentNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NODE_ENV",
] as const;
const originalEnvironment = Object.fromEntries(environmentNames.map((name) => [name, process.env[name]]));

function setEnvironment(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function restoreEnvironment() {
  for (const name of environmentNames) setEnvironment(name, originalEnvironment[name]);
  resetGenerateRateLimitForTests();
  rpc.mockReset();
  createClient.mockClear();
}

afterEach(restoreEnvironment);

function request() {
  return new Request("https://creator.example/generate", {
    headers: { "x-forwarded-for": "203.0.113.20" },
  });
}

describe("shared rate-limit diagnostics", () => {
  it("returns allowed for a valid shared RPC response", async () => {
    setEnvironment("NEXT_PUBLIC_SUPABASE_URL", " https://creator.example.supabase.co ");
    setEnvironment("SUPABASE_SERVICE_ROLE_KEY", " sb_secret_test ");
    setEnvironment("NODE_ENV", "production");
    rpc.mockResolvedValue({ data: [{ allowed: true, retry_after_seconds: 0 }], error: null });

    await expect(checkGenerateRateLimit(request(), "user-1", 1_000, "req-allowed")).resolves.toEqual({
      outcome: "allowed",
      source: "shared",
    });
    expect(createClient).toHaveBeenCalledWith(
      "https://creator.example.supabase.co",
      "sb_secret_test",
    );
  });

  it("returns limited for a valid shared limit response", async () => {
    setEnvironment("NEXT_PUBLIC_SUPABASE_URL", "https://creator.example.supabase.co");
    setEnvironment("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test");
    setEnvironment("NODE_ENV", "production");
    rpc.mockResolvedValue({ data: [{ allowed: false, retry_after_seconds: 37.2 }], error: null });

    await expect(checkGenerateRateLimit(request(), "user-1", 1_000, "req-limited")).resolves.toEqual({
      outcome: "limited",
      retryAfterSeconds: 38,
    });
  });

  it("returns unavailable for an RPC error in production", async () => {
    setEnvironment("NEXT_PUBLIC_SUPABASE_URL", "https://creator.example.supabase.co");
    setEnvironment("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test");
    setEnvironment("NODE_ENV", "production");
    rpc.mockResolvedValue({ data: null, error: { message: "private database detail" } });

    await expect(checkGenerateRateLimit(request(), "user-1", 1_000, "req-error")).resolves.toEqual({
      outcome: "unavailable",
    });
  });

  it("returns unavailable when the service-role key is missing or blank in production", async () => {
    setEnvironment("NEXT_PUBLIC_SUPABASE_URL", "https://creator.example.supabase.co");
    setEnvironment("SUPABASE_SERVICE_ROLE_KEY", " ");
    setEnvironment("NODE_ENV", "production");

    await expect(checkGenerateRateLimit(request(), "user-1", 1_000, "req-missing")).resolves.toEqual({
      outcome: "unavailable",
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("uses the in-memory fallback locally when shared configuration is missing", async () => {
    setEnvironment("NEXT_PUBLIC_SUPABASE_URL", "https://creator.example.supabase.co");
    setEnvironment("SUPABASE_SERVICE_ROLE_KEY", "");
    setEnvironment("NODE_ENV", "test");

    await expect(checkGenerateRateLimit(request(), "user-1", 1_000, "req-local")).resolves.toEqual({
      outcome: "allowed",
      source: "memory",
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("fails closed in production instead of using process-local state", async () => {
    setEnvironment("NEXT_PUBLIC_SUPABASE_URL", "https://creator.example.supabase.co");
    setEnvironment("SUPABASE_SERVICE_ROLE_KEY", " ");
    setEnvironment("NODE_ENV", "production");

    const first = await checkGenerateRateLimit(request(), "user-1", 1_000, "req-prod-1");
    const second = await checkGenerateRateLimit(request(), "user-1", 1_001, "req-prod-2");

    expect(first).toEqual({ outcome: "unavailable" });
    expect(second).toEqual({ outcome: "unavailable" });
    expect(rpc).not.toHaveBeenCalled();
  });
});
