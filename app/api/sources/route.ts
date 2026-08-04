import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireViewer } from "@/lib/api/auth";
import { extractAudienceSignals } from "@/lib/audience/extract-signals";
import { recordBetaEvent } from "@/lib/analytics/events";
import { getStore } from "@/lib/storage";
import { sourceDocumentSchema } from "@/lib/types/product";

export async function GET() { const { viewer, response } = await requireViewer(); if (response) return response; return NextResponse.json({ sources: await getStore().listSources(viewer!.id) }); }
export async function POST(request: Request) { const { viewer, response } = await requireViewer(); if (response) return response; try { const source = sourceDocumentSchema.parse(await request.json()); const signals = extractAudienceSignals(source.content); const saved = await getStore().addSource(viewer!.id, { ...source, signals }); await recordBetaEvent(viewer!.id, "source_added"); return NextResponse.json({ source: saved }, { status: 201 }); } catch (error) { if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid source." }, { status: 400 }); throw error; } }
