import { z } from "zod";

export const targetPlatformSchema = z.enum([
  "LinkedIn",
  "X",
  "TikTok",
  "Instagram",
  "YouTube Shorts",
  "Newsletter",
]);

export const generateInputSchema = z.object({
  transcript: z
    .string()
    .trim()
    .min(80, "Add at least 80 characters of transcript or source material."),
  creatorNiche: z
    .string()
    .trim()
    .min(2, "Add a creator niche."),
  targetPlatform: targetPlatformSchema,
  targetAudience: z
    .string()
    .trim()
    .min(2, "Add a target audience."),
});

export const audienceIntelligenceSchema = z.object({
  coreAudience: z.string(),
  audienceInsights: z.array(z.string()).min(3).max(6),
  painPoints: z.array(z.string()).min(3).max(6),
  motivations: z.array(z.string()).min(3).max(6),
  languageSignals: z.array(z.string()).min(3).max(6),
});

export const contentGapSchema = z.object({
  gap: z.string(),
  whyItMatters: z.string(),
  suggestedExperiment: z.string(),
});

export const contentStrategySchema = z.object({
  positioning: z.string(),
  contentGaps: z.array(contentGapSchema).min(3).max(5),
  viralHooks: z.array(z.string()).min(5).max(8),
  titles: z.array(z.string()).min(5).max(8),
  contentPillars: z.array(z.string()).min(3).max(5),
  growthExperiments: z.array(z.string()).min(3).max(5),
});

export const repurposingSchema = z.object({
  shortFormIdeas: z
    .array(
      z.object({
        format: z.string(),
        idea: z.string(),
        angle: z.string(),
      }),
    )
    .min(3)
    .max(6),
  repurposedContent: z
    .array(
      z.object({
        format: z.string(),
        content: z.string(),
      }),
    )
    .min(3)
    .max(6),
});

export const creatorGrowthPackSchema = z.object({
  audienceInsights: z.array(z.string()),
  contentGaps: contentStrategySchema.shape.contentGaps,
  viralHooks: z.array(z.string()),
  titles: z.array(z.string()),
  shortFormIdeas: repurposingSchema.shape.shortFormIdeas,
  repurposedContent: repurposingSchema.shape.repurposedContent,
  growthExperiments: z.array(z.string()),
  meta: z.object({
    model: z.string(),
    usedMockData: z.boolean(),
  }),
});

export type TargetPlatform = z.infer<typeof targetPlatformSchema>;
export type GenerateInput = z.infer<typeof generateInputSchema>;
export type AudienceIntelligence = z.infer<typeof audienceIntelligenceSchema>;
export type ContentStrategy = z.infer<typeof contentStrategySchema>;
export type RepurposingOutput = z.infer<typeof repurposingSchema>;
export type CreatorGrowthPack = z.infer<typeof creatorGrowthPackSchema>;
