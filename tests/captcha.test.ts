import { afterEach, describe, expect, it } from "vitest";

import { isTurnstileConfigured, isTurnstileRequired, isValidTurnstileToken } from "@/lib/auth/captcha";

const originalNodeEnv = process.env.NODE_ENV;
const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function restore(name: "NODE_ENV" | "NEXT_PUBLIC_TURNSTILE_SITE_KEY", value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else Object.assign(process.env, { [name]: value });
}

afterEach(() => {
  restore("NODE_ENV", originalNodeEnv);
  restore("NEXT_PUBLIC_TURNSTILE_SITE_KEY", originalSiteKey);
});

describe("Turnstile configuration", () => {
  it("requires CAPTCHA in production even if its site key is missing", () => {
    Object.assign(process.env, { NODE_ENV: "production" });
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    expect(isTurnstileRequired()).toBe(true);
    expect(isTurnstileConfigured()).toBe(false);
  });

  it("requires a non-empty, bounded token when configured", () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";

    expect(isTurnstileRequired()).toBe(true);
    expect(isValidTurnstileToken("token")).toBe(true);
    expect(isValidTurnstileToken("")).toBe(false);
    expect(isValidTurnstileToken("x".repeat(2_049))).toBe(false);
  });
});
