import { z } from "zod";

import {
  experimentCreateSchema,
  type ContentExperiment,
} from "@/lib/types/product";

const contextSchema = z.object({
  sourceDocumentId: z.string().uuid().nullable().optional(),
  sourceReference: z.string().trim().min(1).max(240),
  sourceItemKey: z.string().trim().min(1).max(160),
  audienceSegment: z.string().trim().min(1).max(160),
  audienceProblem: z.string().trim().max(500).default(""),
  platform: z.string().trim().min(1).max(80),
  cta: z.string().trim().max(240).default(""),
  intendedOutcome: z.string().trim().max(240).default("Learn what grows the business"),
  variantLabel: z.string().trim().min(1).max(120).default("Original"),
});

const stringItemSchema = z.object({
  value: z.string().trim().min(1).max(500),
});

const contentGapItemSchema = z.object({
  gap: z.string().trim().min(1).max(500),
  whyItMatters: z.string().trim().min(1).max(500),
  suggestedExperiment: z.string().trim().min(1).max(500),
});

const platformAngleItemSchema = z.object({
  format: z.string().trim().min(1).max(120),
  idea: z.string().trim().min(1).max(500),
  angle: z.string().trim().min(1).max(500),
});

const repurposedContentItemSchema = z.object({
  format: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(20_000),
});

export const growthPackExperimentRequestSchema = z.discriminatedUnion("kind", [
  contextSchema.extend({ kind: z.literal("content_gap"), item: contentGapItemSchema }),
  contextSchema.extend({ kind: z.literal("hook"), item: stringItemSchema }),
  contextSchema.extend({ kind: z.literal("title"), item: stringItemSchema }),
  contextSchema.extend({ kind: z.literal("platform_angle"), item: platformAngleItemSchema }),
  contextSchema.extend({ kind: z.literal("repurposed_content"), item: repurposedContentItemSchema }),
  contextSchema.extend({ kind: z.literal("growth_experiment"), item: stringItemSchema }),
]);

export type GrowthPackExperimentRequest = z.infer<typeof growthPackExperimentRequestSchema>;

export function growthPackItemToExperiment(input: GrowthPackExperimentRequest): Omit<ContentExperiment, "id" | "createdAt" | "updatedAt" | "status"> {
  const base = {
    sourceDocumentId: input.sourceDocumentId ?? null,
    sourceReference: input.sourceReference,
    sourceItemKey: input.sourceItemKey,
    audienceSegment: input.audienceSegment,
    audienceProblem: input.audienceProblem,
    platform: input.platform,
    cta: input.cta,
    intendedOutcome: input.intendedOutcome,
    variantLabel: input.variantLabel,
  };

  if (input.kind === "content_gap") {
    return experimentCreateSchema.parse({
      ...base,
      title: input.item.gap,
      hook: input.item.suggestedExperiment,
      format: "Content gap",
      hypothesis: input.item.suggestedExperiment,
      draft: `Why it matters: ${input.item.whyItMatters}\n\nSuggested experiment: ${input.item.suggestedExperiment}`,
    });
  }

  if (input.kind === "hook") {
    return experimentCreateSchema.parse({
      ...base,
      title: input.item.value,
      hook: input.item.value,
      format: "Hook idea",
      hypothesis: `Test whether this hook earns attention from ${input.audienceSegment}.`,
      draft: input.item.value,
    });
  }

  if (input.kind === "title") {
    return experimentCreateSchema.parse({
      ...base,
      title: input.item.value,
      format: "Title",
      hypothesis: `Test whether this title attracts ${input.audienceSegment}.`,
      draft: input.item.value,
    });
  }

  if (input.kind === "platform_angle") {
    return experimentCreateSchema.parse({
      ...base,
      title: input.item.idea,
      hook: input.item.angle,
      format: input.item.format,
      hypothesis: input.item.angle,
      draft: input.item.idea,
    });
  }

  if (input.kind === "repurposed_content") {
    return experimentCreateSchema.parse({
      ...base,
      title: input.item.content.slice(0, 240),
      format: input.item.format,
      hypothesis: `Test this ${input.item.format} repurposing angle with ${input.audienceSegment}.`,
      draft: input.item.content,
    });
  }

  return experimentCreateSchema.parse({
    ...base,
    title: input.item.value.slice(0, 240),
    format: "Growth experiment",
    hypothesis: input.item.value,
    draft: input.item.value,
  });
}
