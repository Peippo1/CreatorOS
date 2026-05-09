import { runAudienceIntelligenceAgent } from "@/lib/agents/audience-intelligence";
import { runContentStrategyAgent } from "@/lib/agents/content-strategy";
import { runRepurposingAgent } from "@/lib/agents/repurposing";
import { hasOpenAIKey } from "@/lib/openai/config";
import { createMockGrowthPack } from "@/lib/orchestration/mock-growth-pack";
import {
  generateInputSchema,
  type CreatorGrowthPack,
  type GenerateInput,
} from "@/lib/types/generation";

export async function generateCreatorGrowthPack(
  rawInput: unknown,
): Promise<CreatorGrowthPack> {
  const input = generateInputSchema.parse(rawInput);

  if (!hasOpenAIKey()) {
    return createMockGrowthPack(input);
  }

  return runAgentFlow(input);
}

async function runAgentFlow(input: GenerateInput): Promise<CreatorGrowthPack> {
  const audience = await runAudienceIntelligenceAgent(input);
  const strategy = await runContentStrategyAgent({
    input,
    audience: audience.output,
  });
  const repurposing = await runRepurposingAgent({
    input,
    audience: audience.output,
    strategy: strategy.output,
  });

  return {
    audienceInsights: audience.output.audienceInsights,
    viralHooks: strategy.output.viralHooks,
    titles: strategy.output.titles,
    shortFormIdeas: repurposing.output.shortFormIdeas,
    repurposedContent: repurposing.output.repurposedContent,
    growthExperiments: strategy.output.growthExperiments,
    meta: {
      model: repurposing.model,
      usedMockData: false,
    },
  };
}
