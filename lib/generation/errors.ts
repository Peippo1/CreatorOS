export class GenerationTimeoutError extends Error {
  constructor() {
    super("Generation timed out.");
    this.name = "GenerationTimeoutError";
  }
}

export class UpstreamGenerationError extends Error {
  constructor(message = "Generation provider failed.") {
    super(message);
    this.name = "UpstreamGenerationError";
  }
}

export function getPublicGenerationError(error: unknown): {
  status: number;
  message: string;
} {
  if (error instanceof GenerationTimeoutError) {
    return {
      status: 504,
      message: "Generation took too long. Please try again.",
    };
  }

  if (error instanceof UpstreamGenerationError) {
    return {
      status: 502,
      message: "The generation service is temporarily unavailable. Please try again.",
    };
  }

  return {
    status: 500,
    message: "CreatorOS could not generate a growth pack.",
  };
}
