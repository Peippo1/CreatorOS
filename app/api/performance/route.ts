import { ZodError } from "zod";

import { requireViewer } from "@/lib/api/auth";
import { jsonResponse, MalformedJsonRequestError, parseJsonBody, RequestBodyTooLargeError } from "@/lib/api/request";
import { getStore } from "@/lib/storage";
import { performanceSchema } from "@/lib/types/product";

export async function GET(request: Request) {
  const { viewer, response } = await requireViewer(request);
  if (response) return response;
  return jsonResponse({ snapshots: await getStore().listPerformance(viewer!.id) });
}

export async function POST(request: Request) {
  const { viewer, response } = await requireViewer(request, { stateChanging: true });
  if (response) return response;

  try {
    const metric = performanceSchema.parse(await parseJsonBody(request));
    const experiment = (await getStore().listExperiments(viewer!.id)).find((item) => item.id === metric.experimentId);
    if (!experiment) return jsonResponse({ error: "Experiment not found." }, { status: 404 });
    return jsonResponse({ snapshot: await getStore().addPerformance(viewer!.id, metric) }, { status: 201 });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return jsonResponse({ error: "Request body is too large." }, { status: 413 });
    if (error instanceof MalformedJsonRequestError) return jsonResponse({ error: "Malformed JSON request." }, { status: 400 });
    if (error instanceof ZodError) return jsonResponse({ error: error.issues[0]?.message ?? "Invalid performance data." }, { status: 400 });
    throw error;
  }
}
