import { afterEach, describe, expect, it } from "vitest";

import { generateCreatorGrowthPack } from "@/lib/orchestration/generate-growth-pack";
import { createMockGrowthPack } from "@/lib/orchestration/mock-growth-pack";
import { creatorGrowthPackSchema } from "@/lib/types/generation";
import { validGenerateInput } from "./fixtures";

const originalOpenAIKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  process.env.OPENAI_API_KEY = originalOpenAIKey;
});

describe("mock Creator Growth Pack", () => {
  it("conforms to the CreatorGrowthPack schema", () => {
    const growthPack = createMockGrowthPack(validGenerateInput);
    const result = creatorGrowthPackSchema.safeParse(growthPack);

    expect(result.success).toBe(true);
  });

  it("includes first-class content gaps", () => {
    const growthPack = createMockGrowthPack(validGenerateInput);

    expect(growthPack.contentGaps.length).toBeGreaterThan(0);
    expect(growthPack.contentGaps[0]).toEqual(
      expect.objectContaining({
        gap: expect.any(String),
        whyItMatters: expect.any(String),
        suggestedExperiment: expect.any(String),
      }),
    );
  });
});

describe("generateCreatorGrowthPack", () => {
  it("returns mock data when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;

    const growthPack = await generateCreatorGrowthPack(validGenerateInput);

    expect(growthPack.meta.usedMockData).toBe(true);
    expect(growthPack.contentGaps.length).toBeGreaterThan(0);
    expect(creatorGrowthPackSchema.safeParse(growthPack).success).toBe(true);
  });
});
