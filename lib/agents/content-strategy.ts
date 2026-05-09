import { createStructuredResponse } from "@/lib/openai/client";
import { buildContentStrategyPrompt } from "@/lib/prompts/content-strategy";
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
}): Promise<{ output: ContentStrategy; model: string }> {
  const response = await createStructuredResponse({
    schema: contentStrategySchema,
    schemaName: "content_strategy",
    instructions: buildContentStrategyPrompt(input, audience),
    input: input.transcript,
  });

  return {
    output: response.data,
    model: response.model,
  };
}
