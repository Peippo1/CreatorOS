import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordBetaEvent } from "@/lib/analytics/events";
import { requireViewer } from "@/lib/api/auth";
import { growthPackItemToExperiment, growthPackExperimentRequestSchema } from "@/lib/experiments/from-growth-pack";
import { jsonResponse, MalformedJsonRequestError, parseJsonBody, RequestBodyTooLargeError } from "@/lib/api/request";
import { getStore } from "@/lib/storage";

export async function POST(request: Request) {
  const { viewer, response } = await requireViewer(request, { stateChanging: true });
  if (response) return response;

  try {
    const input = growthPackExperimentRequestSchema.parse(await parseJsonBody(request));
    const experiment = growthPackItemToExperiment(input);
    const store = getStore();
    const existing = (await store.listExperiments(viewer!.id)).find(
      (item) => item.sourceItemKey === experiment.sourceItemKey && item.variantLabel === experiment.variantLabel,
    );

    if (existing) {
      return jsonResponse(
        { error: "This Growth Pack item is already saved with that variant label.", experiment: existing },
        { status: 409 },
      );
    }

    const saved = await store.addExperiment(viewer!.id, experiment);
    await recordBetaEvent(viewer!.id, "experiment_created_from_growth_pack");
    return jsonResponse({ experiment: saved }, { status: 201 });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return jsonResponse({ error: "Request body is too large." }, { status: 413 });
    if (error instanceof MalformedJsonRequestError) return jsonResponse({ error: "Malformed JSON request." }, { status: 400 });
    if (error instanceof ZodError) return jsonResponse({ error: error.issues[0]?.message ?? "Invalid Growth Pack experiment." }, { status: 400 });
    throw error;
  }
}
