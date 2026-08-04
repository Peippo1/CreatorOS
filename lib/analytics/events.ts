import "server-only";

import type { BetaEventName } from "@/lib/types/product";
import { getStore } from "@/lib/storage";

export async function recordBetaEvent(userId: string, name: BetaEventName) {
  try {
    await getStore().trackEvent(userId, name);
  } catch {
    // Analytics must never block a creator workflow or expose storage errors.
  }
}
