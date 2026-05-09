import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

import { DEFAULT_OPENAI_MODEL, hasOpenAIKey, resolveOpenAIModel } from "./config";
import {
  getErrorMessage,
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
};

export async function createStructuredResponse<TSchema extends z.ZodType>({
  schema,
  schemaName,
  instructions,
  input,
}: StructuredResponseParams<TSchema>): Promise<{
  data: z.infer<TSchema>;
  model: string;
}> {
  const preferredModel = resolveOpenAIModel();

  try {
    return await requestWithRetries({
      schema,
      schemaName,
      instructions,
      input,
      model: preferredModel,
    });
  } catch (error) {
    if (
      preferredModel !== DEFAULT_OPENAI_MODEL &&
      isModelAvailabilityError(error)
    ) {
      return requestWithRetries({
        schema,
        schemaName,
        instructions,
        input,
        model: DEFAULT_OPENAI_MODEL,
      });
    }

    throw normalizeOpenAIError(error);
  }
}

async function requestWithRetries<TSchema extends z.ZodType>({
  schema,
  schemaName,
  instructions,
  input,
  model,
}: StructuredResponseParams<TSchema> & { model: string }): Promise<{
  data: z.infer<TSchema>;
  model: string;
}> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await getOpenAIClient().responses.parse({
        model,
        instructions,
        input,
        text: {
          format: zodTextFormat(schema, schemaName),
        },
      });

      if (!response.output_parsed) {
        throw new OpenAIResponseError(
          "OpenAI returned an empty structured response.",
        );
      }

      return {
        data: response.output_parsed,
        model,
      };
    } catch (error) {
      lastError = error;

      if (!isRetryableOpenAIError(error) || attempt === MAX_RETRIES) {
        break;
      }

      await wait(300 * 2 ** attempt);
    }
  }

  throw lastError;
}

function normalizeOpenAIError(error: unknown) {
  if (error instanceof MissingOpenAIKeyError) {
    return error;
  }

  if (error instanceof OpenAIResponseError) {
    return error;
  }

  return new OpenAIResponseError(getErrorMessage(error));
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
