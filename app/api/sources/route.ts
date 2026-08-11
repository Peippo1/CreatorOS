import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { extractAudienceSignals } from "@/lib/audience/extract-signals";
import { recordBetaEvent } from "@/lib/analytics/events";
import { requireViewer } from "@/lib/api/auth";
import { jsonResponse, MalformedJsonRequestError, parseJsonBody, RequestBodyTooLargeError } from "@/lib/api/request";
import { getStore } from "@/lib/storage";
import { sourceDocumentSchema } from "@/lib/types/product";

export async function GET(request: Request) {
  const { viewer, response } = await requireViewer(request);
  if (response) return response;
  return jsonResponse({ sources: await getStore().listSources(viewer!.id) });
}

export async function POST(request: Request) {
  const { viewer, response } = await requireViewer(request, { stateChanging: true });
  if (response) return response;

  try {
    const source = sourceDocumentSchema.parse(await parseJsonBody(request));
    const signals = extractAudienceSignals(source.content);
    const saved = await getStore().addSource(viewer!.id, { ...source, signals });
    await recordBetaEvent(viewer!.id, "source_added");
    return jsonResponse({ source: saved }, { status: 201 });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return jsonResponse({ error: "Request body is too large." }, { status: 413 });
    if (error instanceof MalformedJsonRequestError) return jsonResponse({ error: "Malformed JSON request." }, { status: 400 });
    if (error instanceof ZodError) return jsonResponse({ error: error.issues[0]?.message ?? "Invalid source." }, { status: 400 });
    throw error;
  }
}
