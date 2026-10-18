import { describe, expect, it } from "vitest";

import {
  clearAudienceCache,
  getAudienceCacheKey,
  getCachedAudience,
  setCachedAudience,
} from "@/lib/orchestration/audience-cache";
import { validGenerateInput } from "./fixtures";

describe("audience cache", () => {
  it("uses a content-blind hash key and returns cached data", () => {
    clearAudienceCache();
    const output = {
      coreAudience: "Solo creators",
      audienceInsights: ["Signal one"],
      painPoints: ["Pain one"],
      motivations: ["Motivation one"],
      languageSignals: ["Language one"],
    };

    setCachedAudience(validGenerateInput, {
      output,
      model: "test-model",
      telemetry: { inputTokens: 10, outputTokens: 5 },
    });

    const key = getAudienceCacheKey(validGenerateInput);
    expect(key).toMatch(/^[a-f0-9]{64}$/);
    expect(key).not.toContain(validGenerateInput.transcript);
    expect(getCachedAudience(validGenerateInput)?.output).toEqual(output);
  });
});
