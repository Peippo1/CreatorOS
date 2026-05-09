import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { generateCreatorGrowthPack } from "@/lib/orchestration/generate-growth-pack";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const growthPack = await generateCreatorGrowthPack(body);

    return NextResponse.json({ growthPack });
  } catch (error) {
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
