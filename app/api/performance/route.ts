import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireViewer } from "@/lib/api/auth";
import { getStore } from "@/lib/storage";
import { performanceSchema } from "@/lib/types/product";

export async function GET() { const { viewer, response } = await requireViewer(); if (response) return response; return NextResponse.json({ snapshots: await getStore().listPerformance(viewer!.id) }); }
export async function POST(request: Request) { const { viewer, response } = await requireViewer(); if (response) return response; try { const metric = performanceSchema.parse(await request.json()); const experiment = (await getStore().listExperiments(viewer!.id)).find((item) => item.id === metric.experimentId); if (!experiment) return NextResponse.json({ error: "Experiment not found." }, { status: 404 }); return NextResponse.json({ snapshot: await getStore().addPerformance(viewer!.id, metric) }, { status: 201 }); } catch (error) { if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid performance data." }, { status: 400 }); throw error; } }
