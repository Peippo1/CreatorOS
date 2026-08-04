import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireViewer } from "@/lib/api/auth";
import { getStore } from "@/lib/storage";
import { experimentUpdateSchema } from "@/lib/types/product";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const { viewer, response } = await requireViewer(); if (response) return response; try { const patch = experimentUpdateSchema.parse(await request.json()); const experiment = await getStore().updateExperiment(viewer!.id, (await params).id, patch); if (!experiment) return NextResponse.json({ error: "Experiment not found." }, { status: 404 }); return NextResponse.json({ experiment }); } catch (error) { if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid experiment." }, { status: 400 }); throw error; } }
