import { describe, expect, it } from "vitest";

import { getOpenAIErrorCategory, isRetryableOpenAIError } from "@/lib/openai/errors";

describe("OpenAI error classification", () => {
  it("does not retry exhausted quota errors", () => {
    const error = Object.assign(new Error("quota exceeded"), {
      status: 429,
      code: "insufficient_quota",
    });

    expect(isRetryableOpenAIError(error)).toBe(false);
    expect(getOpenAIErrorCategory(error)).toBe("quota");
  });

  it("keeps transient rate limits retryable", () => {
    const error = Object.assign(new Error("rate limited"), {
      status: 429,
      code: "rate_limit_exceeded",
    });

    expect(isRetryableOpenAIError(error)).toBe(true);
    expect(getOpenAIErrorCategory(error)).toBe("rate_limited");
  });
});
