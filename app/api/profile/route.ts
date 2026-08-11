import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordBetaEvent } from "@/lib/analytics/events";
import { requireViewer } from "@/lib/api/auth";
import { jsonResponse, MalformedJsonRequestError, parseJsonBody, RequestBodyTooLargeError } from "@/lib/api/request";
import { getStore } from "@/lib/storage";
import { creatorProfileSchema } from "@/lib/types/product";

export async function GET(request: Request) {
  const { viewer, response } = await requireViewer(request);
  if (response) return response;
  return jsonResponse({ profile: await getStore().getProfile(viewer!.id) });
}

export async function PUT(request: Request) {
  const { viewer, response } = await requireViewer(request, { stateChanging: true });
  if (response) return response;

  try {
    const profile = creatorProfileSchema.parse(await parseJsonBody(request));
    const saved = await getStore().saveProfile(viewer!.id, profile);
    await recordBetaEvent(viewer!.id, "profile_saved");
    return jsonResponse({ profile: saved });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return jsonResponse({ error: "Request body is too large." }, { status: 413 });
    if (error instanceof MalformedJsonRequestError) return jsonResponse({ error: "Malformed JSON request." }, { status: 400 });
    if (error instanceof ZodError) return jsonResponse({ error: error.issues[0]?.message ?? "Invalid profile." }, { status: 400 });
    throw error;
  }
}
