import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/health/route";

const originalOpenAIKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  if (originalOpenAIKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalOpenAIKey;
  vi.unstubAllEnvs();
});

describe("GET /api/health", () => {
  it("reports local readiness without an OpenAI key", async () => {
    delete process.env.OPENAI_API_KEY;
    vi.stubEnv("NODE_ENV", "test");

    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      service: "creatoros",
      configured: false,
    });
  });

  it("reports production as unavailable when the key is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    vi.stubEnv("NODE_ENV", "production");

    const response = GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      status: "not_configured",
      service: "creatoros",
      configured: false,
    });
  });
});
