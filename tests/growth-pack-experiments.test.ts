import { describe, expect, it } from "vitest";

import {
  growthPackExperimentRequestSchema,
  growthPackItemToExperiment,
} from "@/lib/experiments/from-growth-pack";

const context = {
  sourceReference: "Growth Pack generation-1",
  sourceItemKey: "generation-1:content_gap:0",
  audienceSegment: "solo creators",
  audienceProblem: "inconsistent publishing",
  platform: "LinkedIn",
  cta: "Join the newsletter",
  intendedOutcome: "Learn which angle earns qualified signups",
  variantLabel: "Original",
};

describe("Growth Pack experiment transformation", () => {
  it("preserves content-gap rationale and creates an idea experiment", () => {
    const input = growthPackExperimentRequestSchema.parse({
      kind: "content_gap",
      item: {
        gap: "No content addresses consistency",
        whyItMatters: "Creators need a repeatable process",
        suggestedExperiment: "Test a weekly planning walkthrough",
      },
      ...context,
    });

    const experiment = growthPackItemToExperiment(input);

    expect(experiment).toMatchObject({
      sourceReference: "Growth Pack generation-1",
      sourceItemKey: "generation-1:content_gap:0",
      audienceSegment: "solo creators",
      audienceProblem: "inconsistent publishing",
      hook: "Test a weekly planning walkthrough",
      platform: "LinkedIn",
      format: "Content gap",
      cta: "Join the newsletter",
      intendedOutcome: "Learn which angle earns qualified signups",
      hypothesis: "Test a weekly planning walkthrough",
      variantLabel: "Original",
    });
    expect(experiment.draft).toContain("Creators need a repeatable process");
  });

  it("maps repurposed content into an editable draft", () => {
    const input = growthPackExperimentRequestSchema.parse({
      kind: "repurposed_content",
      item: { format: "Short video", content: "Three steps to plan next week's content." },
      ...context,
      sourceItemKey: "generation-1:repurposed_content:0",
    });

    expect(growthPackItemToExperiment(input)).toMatchObject({
      title: "Three steps to plan next week's content.",
      format: "Short video",
      draft: "Three steps to plan next week's content.",
      status: undefined,
    });
  });

  it("rejects incomplete generated item data", () => {
    expect(() => growthPackExperimentRequestSchema.parse({
      kind: "hook",
      item: { value: "" },
      ...context,
    })).toThrow();
  });
});
