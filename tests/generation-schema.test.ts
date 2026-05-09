import { describe, expect, it } from "vitest";

import { generateInputSchema } from "@/lib/types/generation";
import { validGenerateInput } from "./fixtures";

describe("generateInputSchema", () => {
  it("accepts valid generation input", () => {
    const result = generateInputSchema.safeParse(validGenerateInput);

    expect(result.success).toBe(true);
  });

  it("rejects missing transcript input", () => {
    const result = generateInputSchema.safeParse({
      ...validGenerateInput,
      transcript: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["transcript"]);
  });

  it("rejects oversized transcript input", () => {
    const result = generateInputSchema.safeParse({
      ...validGenerateInput,
      transcript: "a".repeat(20_001),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["transcript"]);
  });

  it("rejects unsupported target platforms", () => {
    const result = generateInputSchema.safeParse({
      ...validGenerateInput,
      targetPlatform: "Threads",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["targetPlatform"]);
  });
});
