import type {
  AudienceIntelligence,
  ContentStrategy,
  GenerateInput,
} from "@/lib/types/generation";

export function buildRepurposingPrompt(
  input: GenerateInput,
  audience: AudienceIntelligence,
  strategy: ContentStrategy,
) {
  return `You are the Repurposing Agent for CreatorOS.

Transform the source transcript and strategy into repurposable creator assets.

Creator niche: ${input.creatorNiche}
Target platform: ${input.targetPlatform}
Target audience: ${input.targetAudience}
Positioning: ${strategy.positioning}
Content pillars: ${strategy.contentPillars.join(" | ")}
Best audience language: ${audience.languageSignals.join(" | ")}

Rules:
- Preserve the creator's core ideas.
- Make outputs immediately usable.
- Keep short-form ideas concrete enough to produce.
- Repurposed content should include different formats, not minor rewrites.
- Return only the requested structured data.`;
}
