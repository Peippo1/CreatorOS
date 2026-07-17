import { GenerationTimeoutError } from "@/lib/generation/errors";

export const GENERATION_DEADLINE_MS = 60_000;

type GenerationDeadlineOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function runWithGenerationDeadline<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  { signal, timeoutMs = GENERATION_DEADLINE_MS }: GenerationDeadlineOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutError = new GenerationTimeoutError();
  let timedOut = false;
  const onAbort = () => controller.abort(signal?.reason);

  if (signal?.aborted) {
    controller.abort(signal.reason);
  } else {
    signal?.addEventListener("abort", onAbort, { once: true });
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort(timeoutError);
      reject(timeoutError);
    }, timeoutMs);
  });

  try {
    const guardedOperation = operation(controller.signal).catch((error) => {
      if (timedOut) {
        throw timeoutError;
      }

      throw error;
    });

    return await Promise.race([guardedOperation, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    signal?.removeEventListener("abort", onAbort);
  }
}
