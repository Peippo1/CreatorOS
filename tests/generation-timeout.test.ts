import { describe, expect, it, vi } from "vitest";

import { GenerationTimeoutError } from "@/lib/generation/errors";
import {
  runWithGenerationDeadline,
  runWithStageTimeout,
} from "@/lib/orchestration/generation-deadline";

describe("generation deadline", () => {
  it("aborts in-flight work and reports a timeout when the deadline expires", async () => {
    vi.useFakeTimers();

    const operation = vi.fn(
      (signal: AbortSignal) =>
        new Promise<never>((_, reject) => {
          signal.addEventListener("abort", () => reject(new Error("request aborted")), {
            once: true,
          });
        }),
    );

    const result = runWithGenerationDeadline(operation, { timeoutMs: 100 });
    const rejection = expect(result).rejects.toBeInstanceOf(GenerationTimeoutError);
    await vi.advanceTimersByTimeAsync(100);

    await rejection;
    expect(operation).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it("supports an independent stage timeout", async () => {
    vi.useFakeTimers();

    const result = runWithStageTimeout(
      () => new Promise<never>(() => undefined),
      { timeoutMs: 50 },
    );

    const rejection = expect(result).rejects.toBeInstanceOf(GenerationTimeoutError);
    await vi.advanceTimersByTimeAsync(50);
    await rejection;

    vi.useRealTimers();
  });
});
