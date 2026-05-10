import { describe, expect, it } from "vitest";

import { createMockGrowthPack } from "@/lib/orchestration/mock-growth-pack";
import {
  buildEvaluationArtifact,
  formatEvaluationJson,
  formatEvaluationMarkdown,
  parseEvaluationOptions,
} from "@/scripts/evaluate-prompts";
import {
  educationalYoutubeFixture,
  fitnessFixture,
  technicalFounderFixture,
} from "./fixtures";

describe("evaluate-prompts CLI helpers", () => {
  it("parses write and format flags", () => {
    expect(parseEvaluationOptions(["--write"])).toEqual({
      write: true,
      format: "markdown",
    });
    expect(parseEvaluationOptions(["--format", "json"])).toEqual({
      write: false,
      format: "json",
    });
    expect(parseEvaluationOptions(["--format=markdown"])).toEqual({
      write: false,
      format: "markdown",
    });
  });

  it("builds evaluation artifacts with rubric scaffolding", () => {
    const growthPack = createMockGrowthPack(technicalFounderFixture);
    const fixture = {
      ...technicalFounderFixture,
      name: "Technical founder creator",
    };
    const artifact = buildEvaluationArtifact(
      fixture,
      growthPack,
      "2026-05-10T10:00:00.000Z",
    );

    expect(artifact.fixtureName).toBe("Technical founder creator");
    expect(artifact.rubric).toHaveLength(7);
    expect(artifact.rubric[0]).toEqual({
      heading: "Specificity",
      score: "",
      notes: "",
    });
    expect(formatEvaluationMarkdown(artifact)).toContain("## Rubric");
    expect(formatEvaluationMarkdown(artifact)).toContain("```json");
    expect(formatEvaluationJson(artifact)).toContain('"fixtureName"');
    expect(formatEvaluationJson(artifact)).toContain('"growthPack"');
  });

  it("produces deterministic outputs for the evaluation fixtures", () => {
    const technical = createMockGrowthPack(technicalFounderFixture);
    const fitness = createMockGrowthPack(fitnessFixture);
    const youtube = createMockGrowthPack(educationalYoutubeFixture);

    expect(technical.contentGaps[0].gap).not.toEqual(fitness.contentGaps[0].gap);
    expect(fitness.contentGaps[0].gap).not.toEqual(youtube.contentGaps[0].gap);
  });
});
