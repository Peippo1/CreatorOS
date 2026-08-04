import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireViewer } from "@/lib/api/auth";
import { getStore } from "@/lib/storage";
import { experimentCreateSchema } from "@/lib/types/product";

export async function GET() { const { viewer, response } = await requireViewer(); if (response) return response; return NextResponse.json({ experiments: await getStore().listExperiments(viewer!.id) }); }
export async function POST(request: Request) { const { viewer, response } = await requireViewer(); if (response) return response; try { const experiment = experimentCreateSchema.parse(await request.json()); return NextResponse.json({ experiment: await getStore().addExperiment(viewer!.id, experiment) }, { status: 201 }); } catch (error) { if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid experiment." }, { status: 400 }); throw error; } }
