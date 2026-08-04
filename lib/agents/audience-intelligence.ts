import { createStructuredResponse } from "@/lib/openai/client";
import { buildAudienceIntelligencePrompt } from "@/lib/prompts/audience-intelligence";
import { formatPromptContext } from "@/lib/prompts/context";
import {
  audienceIntelligenceSchema,
  type AudienceIntelligence,
  type GenerateInput,
} from "@/lib/types/generation";

export async function runAudienceIntelligenceAgent(
  input: GenerateInput,
  { signal }: { signal?: AbortSignal } = {},
): Promise<{ output: AudienceIntelligence; model: string }> {
  const response = await createStructuredResponse({
    schema: audienceIntelligenceSchema,
    schemaName: "audience_intelligence",
    instructions: buildAudienceIntelligencePrompt(input),
    input: formatPromptContext({ transcript: input.transcript, profileContext: input.profileContext }),
    signal,
  });

  return {
    output: response.data,
    model: response.model,
  };
}
