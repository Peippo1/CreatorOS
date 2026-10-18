import { createStructuredResponse } from "@/lib/openai/client";
import { buildRepurposingPrompt } from "@/lib/prompts/repurposing";
import { formatPromptContext } from "@/lib/prompts/context";
import { resolveGenerationStageConfig } from "@/lib/openai/config";
import {
  repurposingSchema,
  type AudienceIntelligence,
  type ContentStrategy,
  type GenerateInput,
  type RepurposingOutput,
} from "@/lib/types/generation";

export async function runRepurposingAgent({
  input,
  audience,
  strategy,
}: {
  input: GenerateInput;
  audience: AudienceIntelligence;
  strategy: ContentStrategy;
}, { signal }: { signal?: AbortSignal } = {}): Promise<{
  output: RepurposingOutput;
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
  const stageConfig = resolveGenerationStageConfig("repurposing");
  const response = await createStructuredResponse({
    schema: repurposingSchema,
    schemaName: "repurposing",
    instructions: buildRepurposingPrompt(),
    input: formatPromptContext({
      creator: {
        creatorNiche: input.creatorNiche,
        targetPlatform: input.targetPlatform,
        targetAudience: input.targetAudience,
        profileContext: input.profileContext,
      },
      transcript: input.transcript,
      audience,
      strategy,
    }),
    signal,
    model: stageConfig.model,
    maxOutputTokens: stageConfig.maxOutputTokens,
    stage: "repurposing",
  });

  return {
    output: response.data,
    model: response.model,
    telemetry: { ...response.telemetry, cacheHit: false },
  };
}
