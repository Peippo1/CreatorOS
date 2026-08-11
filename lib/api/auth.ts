import { getViewer } from "@/lib/auth/viewer";
import { isProductionPersistenceConfigured } from "@/lib/config/runtime";
import { sameOriginResponse, jsonResponse } from "@/lib/api/request";

export async function requireViewer(request?: Request, options: { stateChanging?: boolean } = {}) {
  if (options.stateChanging && request) {
    const originResponse = sameOriginResponse(request);
    if (originResponse) return { viewer: null, response: originResponse };
  }

  const viewer = await getViewer();
  if (!viewer) {
    return {
      viewer: null,
      response: jsonResponse({ error: "Sign in to use your CreatorOS workspace." }, { status: 401 }),
    };
  }
  if (!isProductionPersistenceConfigured()) {
    return {
      viewer: null,
      response: jsonResponse({ error: "CreatorOS persistence is not configured." }, { status: 503 }),
    };
  }
  return { viewer, response: null };
}
