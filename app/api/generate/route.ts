import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { checkGenerateRateLimit } from "@/app/api/generate/rate-limit";
import { requireViewer } from "@/lib/api/auth";
import { getPublicGenerationError } from "@/lib/generation/errors";
import { generateCreatorGrowthPack } from "@/lib/orchestration/generate-growth-pack";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_REQUEST_BODY_BYTES = 100_000;

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const { viewer, response: authResponse } = await requireViewer(request, { stateChanging: true });
    if (authResponse) return authResponse;

    const rateLimit = await checkGenerateRateLimit(request, viewer!.id, Date.now(), requestId);

    if (rateLimit.outcome === "limited") {
      return jsonResponse(
        { error: "Too many requests. Please retry later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
            "X-Request-ID": requestId,
          },
        },
      );
    }

    if (rateLimit.outcome === "unavailable") {
      return jsonResponse(
        { error: "Generation service is temporarily unavailable. Please try again later." },
        { status: 503, headers: { "X-Request-ID": requestId } },
      );
    }

    const body = await parseRequestJson(request);
    const growthPack = await generateCreatorGrowthPack(body, {
      signal: request.signal,
    });

    return jsonResponse({ growthPack }, { headers: { "X-Request-ID": requestId } });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return jsonResponse(
        { error: "Request body is too large." },
        { status: 413 },
      );
    }

    if (error instanceof MalformedJsonError) {
      return jsonResponse(
        { error: "Malformed JSON request." },
        { status: 400 },
      );
    }

    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: error.issues[0]?.message ?? "Invalid generation request.",
        },
        { status: 400 },
      );
    }

    const publicError = getPublicGenerationError(error);

    console.error("CreatorOS generation failed", {
      requestId,
      status: publicError.status,
    });

    return jsonResponse(
      { error: publicError.message, requestId },
      {
        status: publicError.status,
        headers: { "X-Request-ID": requestId },
      },
    );
  }
}

function jsonResponse(
  body: Record<string, unknown>,
  init: ResponseInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");

  return NextResponse.json(body, { ...init, headers });
}

class MalformedJsonError extends Error {
  constructor() {
    super("Malformed JSON request.");
    this.name = "MalformedJsonError";
  }
}

class RequestBodyTooLargeError extends Error {
  constructor() {
    super("Request body is too large.");
    this.name = "RequestBodyTooLargeError";
  }
}

async function parseRequestJson(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_REQUEST_BODY_BYTES) {
    throw new RequestBodyTooLargeError();
  }

  try {
    if (!request.body) return null;

    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let totalBytes = 0;
    let body = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_REQUEST_BODY_BYTES) {
        await reader.cancel();
        throw new RequestBodyTooLargeError();
      }

      body += decoder.decode(value, { stream: true });
    }

    body += decoder.decode();
    return JSON.parse(body);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) throw error;
    throw new MalformedJsonError();
  }
}
