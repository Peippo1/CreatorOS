import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordBetaEvent } from "@/lib/analytics/events";
import { requireViewer } from "@/lib/api/auth";
import { growthPackItemToExperiment, growthPackExperimentRequestSchema } from "@/lib/experiments/from-growth-pack";
import { getStore } from "@/lib/storage";

export async function POST(request: Request) {
  const { viewer, response } = await requireViewer();
  if (response) return response;

  try {
    const input = growthPackExperimentRequestSchema.parse(await request.json());
    const experiment = growthPackItemToExperiment(input);
    const store = getStore();
    const existing = (await store.listExperiments(viewer!.id)).find(
      (item) => item.sourceItemKey === experiment.sourceItemKey
        && item.variantLabel === experiment.variantLabel,
    );

    if (existing) {
      return NextResponse.json(
        {
          error: "This Growth Pack item is already saved with that variant label.",
          experiment: existing,
        },
        { status: 409 },
      );
    }

    const saved = await store.addExperiment(viewer!.id, experiment);
    await recordBetaEvent(viewer!.id, "experiment_created_from_growth_pack");
    return NextResponse.json({ experiment: saved }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid Growth Pack experiment." },
        { status: 400 },
      );
    }
    throw error;
  }
}
