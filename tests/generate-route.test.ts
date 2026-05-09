import { afterEach, describe, expect, it } from "vitest";

import { POST } from "@/app/api/generate/route";
import { resetGenerateRateLimitForTests } from "@/app/api/generate/rate-limit";
import { creatorGrowthPackSchema } from "@/lib/types/generation";
import { validGenerateInput } from "./fixtures";

const originalOpenAIKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  if (originalOpenAIKey === undefined) {
    delete process.env.OPENAI_API_KEY;
  } else {
    process.env.OPENAI_API_KEY = originalOpenAIKey;
  }

  resetGenerateRateLimitForTests();
});

function jsonRequest(body: unknown, ip = "203.0.113.10") {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/generate", () => {
  it("returns 200 with a growthPack for valid requests", async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(jsonRequest(validGenerateInput, "203.0.113.1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        growthPack: expect.any(Object),
      }),
    );
    expect(creatorGrowthPackSchema.safeParse(body.growthPack).success).toBe(true);
  });

  it("uses mock data when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(jsonRequest(validGenerateInput, "203.0.113.2"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.growthPack.meta.usedMockData).toBe(true);
  });

  it("returns 400 when transcript is missing", async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(
      jsonRequest({
        ...validGenerateInput,
        transcript: "",
      }, "203.0.113.3"),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Add at least 80 characters of transcript or source material.");
  });

  it("returns 400 for oversized transcript input", async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(
      jsonRequest(
        {
          ...validGenerateInput,
          transcript: "a".repeat(20_001),
        },
        "203.0.113.4",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Transcript must be 20,000 characters or fewer.");
  });

  it("returns 400 for unsupported target platforms", async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(
      jsonRequest(
        {
          ...validGenerateInput,
          targetPlatform: "Threads",
        },
        "203.0.113.5",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns a safe 400 response for malformed JSON", async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "203.0.113.6",
        },
        body: "{not-json",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Malformed JSON request." });
  });

  it("returns 429 with Retry-After after too many requests", async () => {
    delete process.env.OPENAI_API_KEY;

    const ip = "203.0.113.200";

    for (let index = 0; index < 10; index += 1) {
      const response = await POST(jsonRequest(validGenerateInput, ip));
      expect(response.status).toBe(200);
    }

    const response = await POST(jsonRequest(validGenerateInput, ip));
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
    expect(body).toEqual({
      error: "Too many requests. Please retry later.",
    });
  });
});
