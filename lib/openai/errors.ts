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

  return status === 408 || status === 409 || status === 429 || status >= 500;
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
