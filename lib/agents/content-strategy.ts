import { createStructuredResponse } from "@/lib/openai/client";
import { buildContentStrategyPrompt } from "@/lib/prompts/content-strategy";
import { formatPromptContext } from "@/lib/prompts/context";
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
}> {
  const response = await createStructuredResponse({
    schema: contentStrategySchema,
    schemaName: "content_strategy",
    instructions: buildContentStrategyPrompt(input, audience),
    input: formatPromptContext({ transcript: input.transcript }),
    signal,
  });

  return {
    output: response.data,
    model: response.model,
  };
}
