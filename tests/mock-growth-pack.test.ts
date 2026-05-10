import { describe, expect, it } from "vitest";

import { createMockGrowthPack } from "@/lib/orchestration/mock-growth-pack";
import { creatorGrowthPackSchema } from "@/lib/types/generation";
import {
  educationalYoutubeFixture,
  fitnessFixture,
  technicalFounderFixture,
} from "./fixtures";

describe("createMockGrowthPack", () => {
  it("conforms to the CreatorGrowthPack schema for demo fixtures", () => {
    for (const fixture of [
      technicalFounderFixture,
      fitnessFixture,
      educationalYoutubeFixture,
    ]) {
      const growthPack = createMockGrowthPack(fixture);
      const result = creatorGrowthPackSchema.safeParse(growthPack);

      expect(result.success).toBe(true);
    }
  });

  it("varies by creator niche, platform, audience, and transcript", () => {
    const technical = createMockGrowthPack(technicalFounderFixture);
    const fitness = createMockGrowthPack(fitnessFixture);
    const youtube = createMockGrowthPack(educationalYoutubeFixture);

    expect(technical.meta.usedMockData).toBe(true);
    expect(fitness.meta.usedMockData).toBe(true);
    expect(youtube.meta.usedMockData).toBe(true);

    expect(technical.contentGaps[0].gap).not.toEqual(fitness.contentGaps[0].gap);
    expect(fitness.contentGaps[0].gap).not.toEqual(youtube.contentGaps[0].gap);
    expect(technical.shortFormIdeas[0].format).toContain("LinkedIn");
    expect(fitness.shortFormIdeas[0].format).toContain("Instagram");
    expect(youtube.shortFormIdeas[0].format).toContain("YouTube Shorts");
  });
});
