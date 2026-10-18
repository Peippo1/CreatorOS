export const DEFAULT_OPENAI_MODEL = "gpt-5.2";
export const REQUESTED_ENV_MODEL = "OPENAI_MODEL";
export const REQUESTED_REPURPOSING_MODEL_ENV = "OPENAI_REPURPOSING_MODEL";
export const MOCK_GENERATION_ENV = "CREATOROS_ALLOW_MOCK";

export const GENERATION_STAGE_DEFAULTS = {
  audience: { timeoutMs: 18_000, maxOutputTokens: 1_800 },
  strategy: { timeoutMs: 22_000, maxOutputTokens: 2_400 },
  repurposing: { timeoutMs: 20_000, maxOutputTokens: 2_200 },
} as const;

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}

export function allowsMockGeneration() {
  return !isProductionEnvironment() && process.env[MOCK_GENERATION_ENV] !== "false";
}

export function resolveOpenAIModel() {
  return process.env[REQUESTED_ENV_MODEL]?.trim() || DEFAULT_OPENAI_MODEL;
}

export function resolveRepurposingModel() {
  return (
    process.env[REQUESTED_REPURPOSING_MODEL_ENV]?.trim() ||
    resolveOpenAIModel()
  );
}

function resolvePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value?.trim());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function resolveGenerationStageConfig(
  stage: keyof typeof GENERATION_STAGE_DEFAULTS,
) {
  const defaults = GENERATION_STAGE_DEFAULTS[stage];
  const prefix = `CREATOROS_${stage.toUpperCase()}_`;

  return {
    timeoutMs: resolvePositiveInteger(
      process.env[`${prefix}TIMEOUT_MS`],
      defaults.timeoutMs,
    ),
    maxOutputTokens: resolvePositiveInteger(
      process.env[`${prefix}MAX_OUTPUT_TOKENS`],
      defaults.maxOutputTokens,
    ),
    model:
      stage === "repurposing" ? resolveRepurposingModel() : resolveOpenAIModel(),
  };
}
