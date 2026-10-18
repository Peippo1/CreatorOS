export class MissingOpenAIKeyError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not configured.");
    this.name = "MissingOpenAIKeyError";
  }
}

export class OpenAIResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIResponseError";
  }
}

export function isModelAvailabilityError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("model") &&
    (message.includes("not found") ||
      message.includes("does not exist") ||
      message.includes("access") ||
      message.includes("unavailable") ||
      message.includes("unsupported"))
  );
}

export function isRetryableOpenAIError(error: unknown) {
  const status = getStatusCode(error);

  if (status === 429) {
    return getErrorCode(error) !== "insufficient_quota";
  }

  return status === 408 || status === 409 || status >= 500;
}

export type OpenAIErrorCategory =
  | "missing_key"
  | "quota"
  | "rate_limited"
  | "model_unavailable"
  | "timeout"
  | "provider"
  | "unknown";

export function getOpenAIErrorCategory(error: unknown): OpenAIErrorCategory {
  if (error instanceof MissingOpenAIKeyError) return "missing_key";
  if (isModelAvailabilityError(error)) return "model_unavailable";

  const status = getStatusCode(error);
  if (status === 408) return "timeout";
  if (status === 429) {
    return getErrorCode(error) === "insufficient_quota"
      ? "quota"
      : "rate_limited";
  }
  if (status >= 400 && status < 600) return "provider";
  return "unknown";
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected OpenAI error.";
}

function getStatusCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return 0;
}

function getErrorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return "";
}
