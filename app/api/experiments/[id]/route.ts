import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordBetaEvent } from "@/lib/analytics/events";
import { requireViewer } from "@/lib/api/auth";
import { jsonResponse, MalformedJsonRequestError, parseJsonBody, RequestBodyTooLargeError } from "@/lib/api/request";
import { getStore } from "@/lib/storage";
import { experimentUpdateSchema } from "@/lib/types/product";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { viewer, response } = await requireViewer(request, { stateChanging: true });
  if (response) return response;

  try {
    const patch = experimentUpdateSchema.parse(await parseJsonBody(request));
    if (patch.sourceDocumentId && !(await getStore().getSource(viewer!.id, patch.sourceDocumentId))) {
      return jsonResponse({ error: "Source not found." }, { status: 404 });
    }
    const experiment = await getStore().updateExperiment(viewer!.id, (await params).id, patch);
    if (!experiment) return jsonResponse({ error: "Experiment not found." }, { status: 404 });
    if (patch.status === "published") await recordBetaEvent(viewer!.id, "experiment_published");
    if (patch.status === "reviewed") await recordBetaEvent(viewer!.id, "weekly_review_completed");
    return jsonResponse({ experiment });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return jsonResponse({ error: "Request body is too large." }, { status: 413 });
    if (error instanceof MalformedJsonRequestError) return jsonResponse({ error: "Malformed JSON request." }, { status: 400 });
    if (error instanceof ZodError) return jsonResponse({ error: error.issues[0]?.message ?? "Invalid experiment." }, { status: 400 });
    throw error;
  }
}
