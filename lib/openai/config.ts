export const DEFAULT_OPENAI_MODEL = "gpt-5.2";
export const REQUESTED_ENV_MODEL = "OPENAI_MODEL";

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function resolveOpenAIModel() {
  return process.env[REQUESTED_ENV_MODEL]?.trim() || DEFAULT_OPENAI_MODEL;
}
