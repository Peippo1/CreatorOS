import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generate: vi.fn(),
}));

vi.mock("@/lib/orchestration/generate-growth-pack", () => ({
  generateCreatorGrowthPack: mocks.generate,
}));

import { POST } from "@/app/api/generate/route";
import { resetGenerateRateLimitForTests } from "@/app/api/generate/rate-limit";
import { UpstreamGenerationError } from "@/lib/generation/errors";
import { validGenerateInput } from "./fixtures";

afterEach(() => {
  mocks.generate.mockReset();
  resetGenerateRateLimitForTests();
});

describe("POST /api/generate safety", () => {
  it("returns a safe, non-cacheable provider failure with a request ID", async () => {
    mocks.generate.mockRejectedValue(
      new UpstreamGenerationError("OpenAI rejected api-key=secret-value"),
    );

    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "203.0.113.50",
        },
        body: JSON.stringify(validGenerateInput),
      }),
    );

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Request-ID")).toMatch(/.+/);
    expect(await response.json()).toEqual({
      error: "The generation service is temporarily unavailable. Please try again.",
      requestId: expect.any(String),
    });
  });
});
