import { ZodError } from "zod";

import { recordBetaEvent } from "@/lib/analytics/events";
import { requireViewer } from "@/lib/api/auth";
import { jsonResponse, MalformedJsonRequestError, parseJsonBody, RequestBodyTooLargeError } from "@/lib/api/request";
import { getStore } from "@/lib/storage";
import { experimentCreateSchema } from "@/lib/types/product";

export async function GET(request: Request) {
  const { viewer, response } = await requireViewer(request);
  if (response) return response;
  return jsonResponse({ experiments: await getStore().listExperiments(viewer!.id) });
}

export async function POST(request: Request) {
  const { viewer, response } = await requireViewer(request, { stateChanging: true });
  if (response) return response;

  try {
    const experiment = experimentCreateSchema.parse(await parseJsonBody(request));
    if (experiment.sourceDocumentId && !(await getStore().getSource(viewer!.id, experiment.sourceDocumentId))) {
      return jsonResponse({ error: "Source not found." }, { status: 404 });
    }
    const saved = await getStore().addExperiment(viewer!.id, experiment);
    await recordBetaEvent(viewer!.id, "experiment_created");
    return jsonResponse({ experiment: saved }, { status: 201 });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return jsonResponse({ error: "Request body is too large." }, { status: 413 });
    if (error instanceof MalformedJsonRequestError) return jsonResponse({ error: "Malformed JSON request." }, { status: 400 });
    if (error instanceof ZodError) return jsonResponse({ error: error.issues[0]?.message ?? "Invalid experiment." }, { status: 400 });
    throw error;
  }
}
