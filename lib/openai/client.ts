import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";
import { createHash } from "node:crypto";

import {
  DEFAULT_OPENAI_MODEL,
  hasOpenAIKey,
  resolveOpenAIModel,
} from "./config";
import { UpstreamGenerationError } from "@/lib/generation/errors";
import {
  getErrorMessage,
  getOpenAIErrorCategory,
  isModelAvailabilityError,
  isRetryableOpenAIError,
  MissingOpenAIKeyError,
  OpenAIResponseError,
} from "./errors";

const MAX_RETRIES = 2;

let cachedClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!hasOpenAIKey()) {
    throw new MissingOpenAIKeyError();
  }

  cachedClient ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return cachedClient;
}

type StructuredResponseParams<TSchema extends z.ZodType> = {
  schema: TSchema;
  schemaName: string;
  instructions: string;
  input: string;
  signal?: AbortSignal;
  model?: string;
  maxOutputTokens?: number;
  stage?: string;
};

export type StructuredResponseTelemetry = {
  model: string;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  cachedInputTokens?: number;
  attempts: number;
};

export async function createStructuredResponse<TSchema extends z.ZodType>(
  request: StructuredResponseParams<TSchema>,
): Promise<{
  data: z.infer<TSchema>;
  model: string;
  telemetry: StructuredResponseTelemetry;
}> {
  const preferredModel = paramsModelOrDefault(request);

  try {
    return await requestWithRetries({
      ...request,
      model: preferredModel,
    });
  } catch (error) {
    if (
      preferredModel !== DEFAULT_OPENAI_MODEL &&
      isModelAvailabilityError(error)
    ) {
      try {
        return await requestWithRetries({
          schema: request.schema,
          schemaName: request.schemaName,
          instructions: request.instructions,
          input: request.input,
          model: DEFAULT_OPENAI_MODEL,
          signal: request.signal,
          maxOutputTokens: request.maxOutputTokens,
          stage: request.stage,
        });
      } catch (fallbackError) {
        throw normalizeOpenAIError(fallbackError, request.stage);
      }
    }

    throw normalizeOpenAIError(error, request.stage);
  }
}

async function requestWithRetries<TSchema extends z.ZodType>({
  schema,
  schemaName,
  instructions,
  input,
  model,
  signal,
  maxOutputTokens,
}: StructuredResponseParams<TSchema> & { model: string }): Promise<{
  data: z.infer<TSchema>;
  model: string;
  telemetry: StructuredResponseTelemetry;
}> {
  let lastError: unknown;
  const startedAt = Date.now();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      if (signal?.aborted) {
        throw signal.reason;
      }

      const response = await getOpenAIClient().responses.parse({
        model,
        instructions,
        input,
        text: {
          format: zodTextFormat(schema, schemaName),
        },
        max_output_tokens: maxOutputTokens,
        prompt_cache_key: createPromptCacheKey(model, schemaName, instructions),
        store: false,
      }, { maxRetries: 0, signal });

      if (!response.output_parsed) {
        throw new OpenAIResponseError(
          "OpenAI returned an empty structured response.",
        );
      }

      return {
        data: response.output_parsed,
        model: response.model || model,
        telemetry: {
          model: response.model || model,
          durationMs: Date.now() - startedAt,
          inputTokens: response.usage?.input_tokens,
          outputTokens: response.usage?.output_tokens,
          cachedInputTokens: response.usage?.input_tokens_details.cached_tokens,
          attempts: attempt + 1,
        },
      };
    } catch (error) {
      lastError = error;

      if (
        signal?.aborted ||
        !isRetryableOpenAIError(error) ||
        attempt === MAX_RETRIES
      ) {
        break;
      }

      await wait(300 * 2 ** attempt);
    }
  }

  throw lastError;
}

function paramsModelOrDefault<TSchema extends z.ZodType>(
  params: StructuredResponseParams<TSchema>,
) {
  return params.model?.trim() || resolveOpenAIModel();
}

function createPromptCacheKey(
  model: string,
  schemaName: string,
  instructions: string,
) {
  return `creatoros:${createHash("sha256")
    .update(`${model}:${schemaName}:${instructions}`)
    .digest("hex")
    .slice(0, 32)}`;
}

function normalizeOpenAIError(error: unknown, stage?: string) {
  if (error instanceof MissingOpenAIKeyError) {
    return error;
  }

  console.warn(
    JSON.stringify({
      event: "generation_provider_failure",
      stage: stage || "unknown",
      category: getOpenAIErrorCategory(error),
    }),
  );

  return new UpstreamGenerationError(getErrorMessage(error));
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
