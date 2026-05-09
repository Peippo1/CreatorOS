import type {
  AudienceIntelligence,
  GenerateInput,
} from "@/lib/types/generation";

export function buildContentStrategyPrompt(
  input: GenerateInput,
  audience: AudienceIntelligence,
) {
  return `You are the Content Strategy Agent for CreatorOS.

Turn audience intelligence into a platform-specific content strategy.

Creator niche: ${input.creatorNiche}
Target platform: ${input.targetPlatform}
Target audience: ${input.targetAudience}
Core audience: ${audience.coreAudience}
Audience insights: ${audience.audienceInsights.join(" | ")}
Pain points: ${audience.painPoints.join(" | ")}
Motivations: ${audience.motivations.join(" | ")}
Language signals: ${audience.languageSignals.join(" | ")}

Rules:
- Hooks should feel native to ${input.targetPlatform}.
- Titles should be clear, high-signal, and non-clickbait.
- Growth experiments should be actionable in one week.
- Return only the requested structured data.`;
}
