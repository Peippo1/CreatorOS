import { createStructuredResponse } from "@/lib/openai/client";
import { buildContentStrategyPrompt } from "@/lib/prompts/content-strategy";
import { formatPromptContext } from "@/lib/prompts/context";
import { resolveGenerationStageConfig } from "@/lib/openai/config";
import {
  contentStrategySchema,
  type AudienceIntelligence,
  type ContentStrategy,
  type GenerateInput,
} from "@/lib/types/generation";

export async function runContentStrategyAgent({
  input,
  audience,
}: {
  input: GenerateInput;
  audience: AudienceIntelligence;
}, { signal }: { signal?: AbortSignal } = {}): Promise<{
  output: ContentStrategy;
  model: string;
  telemetry: {
    durationMs: number;
    inputTokens?: number;
    outputTokens?: number;
    cachedInputTokens?: number;
    attempts: number;
    cacheHit: boolean;
  };
}> {
  const stageConfig = resolveGenerationStageConfig("strategy");
  const response = await createStructuredResponse({
    schema: contentStrategySchema,
    schemaName: "content_strategy",
    instructions: buildContentStrategyPrompt(),
    input: formatPromptContext({
      creator: {
        creatorNiche: input.creatorNiche,
        targetPlatform: input.targetPlatform,
        targetAudience: input.targetAudience,
        profileContext: input.profileContext,
      },
      transcript: input.transcript,
      audience,
    }),
    signal,
    model: stageConfig.model,
    maxOutputTokens: stageConfig.maxOutputTokens,
    stage: "strategy",
  });

  return {
    output: response.data,
    model: response.model,
    telemetry: { ...response.telemetry, cacheHit: false },
  };
}
