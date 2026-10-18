import { createStructuredResponse } from "@/lib/openai/client";
import { buildAudienceIntelligencePrompt } from "@/lib/prompts/audience-intelligence";
import { formatPromptContext } from "@/lib/prompts/context";
import {
  getCachedAudience,
  setCachedAudience,
} from "@/lib/orchestration/audience-cache";
import { resolveGenerationStageConfig } from "@/lib/openai/config";
import {
  audienceIntelligenceSchema,
  type AudienceIntelligence,
  type GenerateInput,
} from "@/lib/types/generation";

export async function runAudienceIntelligenceAgent(
  input: GenerateInput,
  { signal }: { signal?: AbortSignal } = {},
): Promise<{
  output: AudienceIntelligence;
  model: string;
  telemetry: {
    durationMs: number;
    inputTokens?: number;
    outputTokens?: number;
    cachedInputTokens?: number;
    attempts?: number;
    cacheHit: boolean;
  };
}> {
  const cached = getCachedAudience(input);
  if (cached) {
    return {
      output: cached.output,
      model: cached.model,
      telemetry: {
        ...cached.telemetry,
        durationMs: 0,
        attempts: 0,
        cacheHit: true,
      },
    };
  }

  const stageConfig = resolveGenerationStageConfig("audience");
  const response = await createStructuredResponse({
    schema: audienceIntelligenceSchema,
    schemaName: "audience_intelligence",
    instructions: buildAudienceIntelligencePrompt(),
    input: formatPromptContext({
      transcript: input.transcript,
      profileContext: input.profileContext,
      creator: {
        creatorNiche: input.creatorNiche,
        targetPlatform: input.targetPlatform,
        targetAudience: input.targetAudience,
      },
    }),
    signal,
    model: stageConfig.model,
    maxOutputTokens: stageConfig.maxOutputTokens,
    stage: "audience",
  });

  setCachedAudience(input, {
    output: response.data,
    model: response.model,
    telemetry: response.telemetry,
  });

  return {
    output: response.data,
    model: response.model,
    telemetry: { ...response.telemetry, cacheHit: false },
  };
}
