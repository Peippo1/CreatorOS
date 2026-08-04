import { afterEach, describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";

const originalOpenAIKey = process.env.OPENAI_API_KEY;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalOpenAIKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalOpenAIKey;
  process.env.NODE_ENV = originalNodeEnv;
});

describe("GET /api/health", () => {
  it("reports local readiness without an OpenAI key", async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.NODE_ENV = "test";

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
    process.env.NODE_ENV = "production";

    const response = GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      status: "not_configured",
      service: "creatoros",
      configured: false,
    });
  });
});
