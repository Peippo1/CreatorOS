import { z } from "zod";

export const experimentStatusSchema = z.enum(["idea", "drafting", "ready", "published", "reviewed"]);
export const sourceTypeSchema = z.enum(["transcript", "podcast_notes", "sales_call", "comment", "audience_question", "research"]);

export const creatorProfileSchema = z.object({
  positioning: z.string().trim().max(500).default(""),
  offer: z.string().trim().max(500).default(""),
  audienceSegments: z.array(z.string().trim().min(1).max(160)).max(8).default([]),
  painPoints: z.array(z.string().trim().min(1).max(240)).max(12).default([]),
  objections: z.array(z.string().trim().min(1).max(240)).max(12).default([]),
  motivations: z.array(z.string().trim().min(1).max(240)).max(12).default([]),
  contentPillars: z.array(z.string().trim().min(1).max(120)).max(8).default([]),
  brandVoice: z.string().trim().max(500).default(""),
  prohibitedClaims: z.array(z.string().trim().min(1).max(240)).max(12).default([]),
  conversionGoal: z.string().trim().max(240).default(""),
  platformPriorities: z.array(z.string().trim().min(1).max(80)).max(6).default([]),
});

export const sourceDocumentSchema = z.object({
  title: z.string().trim().min(1).max(160),
  type: sourceTypeSchema,
  content: z.string().trim().min(20).max(50_000),
});

export const audienceSignalSchema = z.object({
  kind: z.enum(["pain_point", "objection", "motivation", "language", "content_pillar"]),
  statement: z.string().trim().min(1).max(240),
  evidence: z.string().trim().min(1).max(320),
  confidence: z.enum(["low", "medium", "high"]),
});

export const betaEventNameSchema = z.enum(["profile_saved", "source_added", "experiment_created", "experiment_published", "weekly_review_completed"]);

export const experimentCreateSchema = z.object({
  sourceDocumentId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(240),
  audienceSegment: z.string().trim().max(160).default(""),
  audienceProblem: z.string().trim().max(500).default(""),
  hook: z.string().trim().max(500).default(""),
  platform: z.string().trim().max(80),
  format: z.string().trim().max(120),
  cta: z.string().trim().max(240).default(""),
  intendedOutcome: z.string().trim().max(240).default(""),
  hypothesis: z.string().trim().max(500).default(""),
  draft: z.string().trim().max(20_000).default(""),
  plannedPublishDate: z.string().date().nullable().optional(),
  variantLabel: z.string().trim().max(120).default("Original"),
});

export const experimentUpdateSchema = experimentCreateSchema.partial().extend({ status: experimentStatusSchema.optional() });

export const performanceSchema = z.object({
  experimentId: z.string().uuid(),
  publishedAt: z.string().date(),
  views: z.coerce.number().int().nonnegative().default(0),
  watchTimeMinutes: z.coerce.number().nonnegative().nullable().optional(),
  likes: z.coerce.number().int().nonnegative().default(0),
  comments: z.coerce.number().int().nonnegative().default(0),
  shares: z.coerce.number().int().nonnegative().default(0),
  saves: z.coerce.number().int().nonnegative().default(0),
  clicks: z.coerce.number().int().nonnegative().default(0),
  signups: z.coerce.number().int().nonnegative().default(0),
  revenue: z.coerce.number().nonnegative().default(0),
  qualifiedLeads: z.coerce.number().int().nonnegative().default(0),
});

export type CreatorProfile = z.infer<typeof creatorProfileSchema>;
export type AudienceSignal = z.infer<typeof audienceSignalSchema>;
export type BetaEventName = z.infer<typeof betaEventNameSchema>;
export type BetaEvent = { name: BetaEventName; occurredAt: string };
export type SourceDocument = z.infer<typeof sourceDocumentSchema> & { id: string; createdAt: string; signals: AudienceSignal[] };
export type ExperimentStatus = z.infer<typeof experimentStatusSchema>;
export type ContentExperiment = z.infer<typeof experimentCreateSchema> & { id: string; status: ExperimentStatus; createdAt: string; updatedAt: string };
export type PerformanceSnapshot = z.infer<typeof performanceSchema> & { id: string; createdAt: string };
export type LearningInsight = { title: string; evidence: string; recommendation: string; confidence: "low" | "medium" | "high" };
