import { createStructuredResponse } from "@/lib/openai/client";
import { buildAudienceIntelligencePrompt } from "@/lib/prompts/audience-intelligence";
import {
  audienceIntelligenceSchema,
  type AudienceIntelligence,
  type GenerateInput,
} from "@/lib/types/generation";

export async function runAudienceIntelligenceAgent(
  input: GenerateInput,
): Promise<{ output: AudienceIntelligence; model: string }> {
  const response = await createStructuredResponse({
    schema: audienceIntelligenceSchema,
    schemaName: "audience_intelligence",
    instructions: buildAudienceIntelligencePrompt(input),
    input: input.transcript,
  });

  return {
    output: response.data,
    model: response.model,
  };
}
