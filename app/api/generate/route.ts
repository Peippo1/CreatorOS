import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { checkGenerateRateLimit } from "@/app/api/generate/rate-limit";
import { getPublicGenerationError } from "@/lib/generation/errors";
import { generateCreatorGrowthPack } from "@/lib/orchestration/generate-growth-pack";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const rateLimit = checkGenerateRateLimit(request);

    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: "Too many requests. Please retry later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const body = await parseRequestJson(request);
    const growthPack = await generateCreatorGrowthPack(body, {
      signal: request.signal,
    });

    return jsonResponse({ growthPack }, { headers: { "X-Request-ID": requestId } });
  } catch (error) {
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

async function parseRequestJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new MalformedJsonError();
  }
}
