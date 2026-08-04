export const DEFAULT_OPENAI_MODEL = "gpt-5.2";
export const REQUESTED_ENV_MODEL = "OPENAI_MODEL";
export const MOCK_GENERATION_ENV = "CREATOROS_ALLOW_MOCK";

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
