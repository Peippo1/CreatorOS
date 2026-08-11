import { afterEach, describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";

const environmentNames = [
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "APP_ORIGIN",
] as const;
const originalEnvironment = Object.fromEntries(environmentNames.map((name) => [name, process.env[name]]));
const originalNodeEnv = process.env.NODE_ENV;

function setEnvironment(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function restoreEnvironment() {
  for (const name of environmentNames) setEnvironment(name, originalEnvironment[name]);
  setEnvironment("NODE_ENV", originalNodeEnv);
}

afterEach(restoreEnvironment);

describe("GET /api/health", () => {
  it("reports local readiness without production configuration", async () => {
    for (const name of environmentNames) setEnvironment(name, undefined);
    setEnvironment("NODE_ENV", "test");

    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      service: "creatoros",
      configured: false,
      openaiConfigured: false,
      supabaseAuthConfigured: false,
      supabasePersistenceConfigured: false,
      turnstileConfigured: false,
      appOriginConfigured: false,
      storageMode: "memory",
      ready: true,
      missing: [
        "OPENAI_API_KEY",
        "SUPABASE_AUTH",
        "SUPABASE_PERSISTENCE",
        "TURNSTILE",
        "APP_ORIGIN",
      ],
    });
  });

  it("reports missing production configuration without exposing values", async () => {
    for (const name of environmentNames) setEnvironment(name, undefined);
    setEnvironment("NODE_ENV", "production");

    const response = GET();

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toMatchObject({
      status: "not_configured",
      service: "creatoros",
      configured: false,
      storageMode: "memory",
      ready: false,
    });
    expect(body).not.toHaveProperty("OPENAI_API_KEY");
    expect(body).not.toHaveProperty("SUPABASE_SERVICE_ROLE_KEY");
    expect(body.missing).toEqual([
      "OPENAI_API_KEY",
      "SUPABASE_AUTH",
      "SUPABASE_PERSISTENCE",
      "TURNSTILE",
      "APP_ORIGIN",
    ]);
  });

  it("reports production ready when all required configuration is present", async () => {
    setEnvironment("OPENAI_API_KEY", "test-openai-key");
    setEnvironment("NEXT_PUBLIC_SUPABASE_URL", "https://creator.example.supabase.co");
    setEnvironment("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    setEnvironment("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    setEnvironment("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test");
    setEnvironment("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "turnstile-site-test");
    setEnvironment("APP_ORIGIN", "https://creator.example.com");
    setEnvironment("NODE_ENV", "production");

    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "ok",
      service: "creatoros",
      configured: true,
      openaiConfigured: true,
      supabaseAuthConfigured: true,
      supabasePersistenceConfigured: true,
      turnstileConfigured: true,
      appOriginConfigured: true,
      storageMode: "supabase",
      ready: true,
      missing: [],
    });
  });
});
