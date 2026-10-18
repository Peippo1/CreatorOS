import { createHash } from "node:crypto";

import type { AudienceIntelligence, GenerateInput } from "@/lib/types/generation";

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 32;

type CachedAudience = {
  output: AudienceIntelligence;
  model: string;
  telemetry: {
    inputTokens?: number;
    outputTokens?: number;
    cachedInputTokens?: number;
  };
  expiresAt: number;
};

const cache = new Map<string, CachedAudience>();

export function getAudienceCacheKey(input: GenerateInput) {
  const stableInput = JSON.stringify({
    transcript: input.transcript,
    creatorNiche: input.creatorNiche,
    targetPlatform: input.targetPlatform,
    targetAudience: input.targetAudience,
    profileContext: input.profileContext ?? null,
  });

  return createHash("sha256").update(stableInput).digest("hex");
}

export function getCachedAudience(input: GenerateInput) {
  const key = getAudienceCacheKey(input);
  const entry = cache.get(key);

  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }

  cache.delete(key);
  cache.set(key, entry);
  return entry;
}

export function setCachedAudience(
  input: GenerateInput,
  value: Omit<CachedAudience, "expiresAt">,
) {
  const key = getAudienceCacheKey(input);
  cache.delete(key);
  cache.set(key, { ...value, expiresAt: Date.now() + CACHE_TTL_MS });

  while (cache.size > CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (!oldestKey) break;
    cache.delete(oldestKey);
  }
}

export function clearAudienceCache() {
  cache.clear();
}
