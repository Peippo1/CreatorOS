import { createStructuredResponse } from "@/lib/openai/client";
import { buildRepurposingPrompt } from "@/lib/prompts/repurposing";
import { formatPromptContext } from "@/lib/prompts/context";
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
}> {
  const response = await createStructuredResponse({
    schema: repurposingSchema,
    schemaName: "repurposing",
    instructions: buildRepurposingPrompt(input, audience, strategy),
    input: formatPromptContext({ transcript: input.transcript }),
    signal,
  });

  return {
    output: response.data,
    model: response.model,
  };
}
