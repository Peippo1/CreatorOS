import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { checkGenerateRateLimit } from "@/app/api/generate/rate-limit";
import { generateCreatorGrowthPack } from "@/lib/orchestration/generate-growth-pack";

export async function POST(request: Request) {
  try {
    const rateLimit = checkGenerateRateLimit(request);

    if (!rateLimit.allowed) {
      return NextResponse.json(
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
    const growthPack = await generateCreatorGrowthPack(body);

    return NextResponse.json({ growthPack });
  } catch (error) {
    if (error instanceof MalformedJsonError) {
      return NextResponse.json(
        { error: "Malformed JSON request." },
        { status: 400 },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Invalid generation request.",
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "CreatorOS could not generate a growth pack.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
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
