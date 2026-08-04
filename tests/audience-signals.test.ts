import { describe, expect, it } from "vitest";

import { extractAudienceSignals } from "@/lib/audience/extract-signals";

describe("extractAudienceSignals", () => {
  it("keeps evidence tied to the source language", () => {
    const signals = extractAudienceSignals("Our members struggle to publish consistently. They want a clearer weekly plan, but they cannot spend all day planning content. One member said: 'I need a repeatable system.'");

    expect(signals.map((signal) => signal.kind)).toEqual(expect.arrayContaining(["pain_point", "motivation", "objection", "language"]));
    expect(signals.every((signal) => signal.evidence.length > 0)).toBe(true);
  });

  it("returns a low-confidence pillar when no explicit signal exists", () => {
    const signals = extractAudienceSignals("This episode explains a practical framework for planning and publishing useful educational content each week.");
    expect(signals).toEqual([{ kind: "content_pillar", statement: "Potential content pillar", evidence: expect.any(String), confidence: "low" }]);
  });
});
