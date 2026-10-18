import { runAudienceIntelligenceAgent } from "@/lib/agents/audience-intelligence";
import { runContentStrategyAgent } from "@/lib/agents/content-strategy";
import { runRepurposingAgent } from "@/lib/agents/repurposing";
import {
  allowsMockGeneration,
  hasOpenAIKey,
  resolveGenerationStageConfig,
} from "@/lib/openai/config";
import { MissingOpenAIKeyError } from "@/lib/openai/errors";
import {
  runWithGenerationDeadline,
  runWithStageTimeout,
} from "@/lib/orchestration/generation-deadline";
import { createMockGrowthPack } from "@/lib/orchestration/mock-growth-pack";
import {
  generateInputSchema,
  type CreatorGrowthPack,
  type GenerateInput,
} from "@/lib/types/generation";

export async function generateCreatorGrowthPack(
  rawInput: unknown,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<CreatorGrowthPack> {
  const input = generateInputSchema.parse(rawInput);

  if (!hasOpenAIKey() && allowsMockGeneration()) {
    return createMockGrowthPack(input);
  }

  if (!hasOpenAIKey()) {
    throw new MissingOpenAIKeyError();
  }

  return runWithGenerationDeadline(
    (signal) => runAgentFlow(input, signal),
    options,
  );
}

async function runAgentFlow(
  input: GenerateInput,
  signal: AbortSignal,
): Promise<CreatorGrowthPack> {
  const audience = await runWithStageTimeout(
    (stageSignal) =>
      runAudienceIntelligenceAgent(input, { signal: stageSignal }),
    { signal, timeoutMs: resolveGenerationStageConfig("audience").timeoutMs },
  );
  const strategy = await runWithStageTimeout(
    (stageSignal) =>
      runContentStrategyAgent(
        { input, audience: audience.output },
        { signal: stageSignal },
      ),
    { signal, timeoutMs: resolveGenerationStageConfig("strategy").timeoutMs },
  );
  const repurposing = await runWithStageTimeout(
    (stageSignal) =>
      runRepurposingAgent(
        { input, audience: audience.output, strategy: strategy.output },
        { signal: stageSignal },
      ),
    { signal, timeoutMs: resolveGenerationStageConfig("repurposing").timeoutMs },
  );

  return {
    audienceInsights: audience.output.audienceInsights,
    contentGaps: strategy.output.contentGaps,
    viralHooks: strategy.output.viralHooks,
    titles: strategy.output.titles,
    shortFormIdeas: repurposing.output.shortFormIdeas,
    repurposedContent: repurposing.output.repurposedContent,
    growthExperiments: strategy.output.growthExperiments,
    meta: {
      model: repurposing.model,
      usedMockData: false,
      stages: [
        { stage: "audience", model: audience.model, ...audience.telemetry },
        { stage: "strategy", model: strategy.model, ...strategy.telemetry },
        {
          stage: "repurposing",
          model: repurposing.model,
          ...repurposing.telemetry,
        },
      ],
    },
  };
}
