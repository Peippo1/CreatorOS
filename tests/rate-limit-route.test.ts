import { describe, expect, it, vi } from "vitest";

const checkLoginRateLimit = vi.hoisted(() => vi.fn());
const signInWithOtp = vi.hoisted(() => vi.fn());

vi.mock("@/app/api/generate/rate-limit", () => ({ checkLoginRateLimit }));
vi.mock("@/lib/app-origin", () => ({ getAppOrigin: () => "https://creator.example.com" }));
vi.mock("@/lib/auth/captcha", () => ({
  isTurnstileConfigured: () => false,
  isTurnstileRequired: () => false,
  isValidTurnstileToken: () => false,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => ({ auth: { signInWithOtp } }),
  isSupabaseConfigured: () => true,
}));

import { POST } from "@/app/api/auth/login/route";

function loginRequest() {
  return new Request("https://creator.example.com/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "tester@example.com" }),
  });
}

describe("login rate-limit responses", () => {
  it("returns 429 and Retry-After for a genuine limit", async () => {
    checkLoginRateLimit.mockResolvedValue({ outcome: "limited", retryAfterSeconds: 42 });

    const response = await POST(loginRequest());

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("42");
    expect(response.headers.get("X-Request-ID")).toMatch(/[0-9a-f-]{36}/);
    expect(await response.json()).toEqual({ error: "Too many sign-in requests. Please try again later." });
    expect(signInWithOtp).not.toHaveBeenCalled();
  });

  it("returns 503 without Retry-After when shared limiting is unavailable", async () => {
    checkLoginRateLimit.mockResolvedValue({ outcome: "unavailable" });

    const response = await POST(loginRequest());

    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBeNull();
    expect(response.headers.get("X-Request-ID")).toMatch(/[0-9a-f-]{36}/);
    expect(await response.json()).toEqual({
      error: "Sign-in service is temporarily unavailable. Please try again later.",
    });
    expect(signInWithOtp).not.toHaveBeenCalled();
  });
});
