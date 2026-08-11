import { describe, expect, it, vi } from "vitest";

const checkGenerateRateLimit = vi.hoisted(() => vi.fn());
const requireViewer = vi.hoisted(() => vi.fn());
const generateCreatorGrowthPack = vi.hoisted(() => vi.fn());

vi.mock("@/app/api/generate/rate-limit", () => ({ checkGenerateRateLimit }));
vi.mock("@/lib/api/auth", () => ({ requireViewer }));
vi.mock("@/lib/orchestration/generate-growth-pack", () => ({ generateCreatorGrowthPack }));
vi.mock("@/lib/generation/errors", () => ({
  getPublicGenerationError: () => ({ status: 500, message: "Generation failed." }),
}));

import { POST } from "@/app/api/generate/route";

function generationRequest() {
  return new Request("https://creator.example.com/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
}

describe("generation rate-limit responses", () => {
  it("returns 429 and Retry-After for a genuine limit", async () => {
    requireViewer.mockResolvedValue({ viewer: { id: "user-1" }, response: null });
    checkGenerateRateLimit.mockResolvedValue({ outcome: "limited", retryAfterSeconds: 23 });

    const response = await POST(generationRequest());

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("23");
    expect(response.headers.get("X-Request-ID")).toMatch(/[0-9a-f-]{36}/);
    expect(await response.json()).toEqual({ error: "Too many requests. Please retry later." });
    expect(generateCreatorGrowthPack).not.toHaveBeenCalled();
  });

  it("returns 503 without Retry-After when shared limiting is unavailable", async () => {
    requireViewer.mockResolvedValue({ viewer: { id: "user-1" }, response: null });
    checkGenerateRateLimit.mockResolvedValue({ outcome: "unavailable" });

    const response = await POST(generationRequest());

    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBeNull();
    expect(response.headers.get("X-Request-ID")).toMatch(/[0-9a-f-]{36}/);
    expect(await response.json()).toEqual({
      error: "Generation service is temporarily unavailable. Please try again later.",
    });
    expect(generateCreatorGrowthPack).not.toHaveBeenCalled();
  });
});
