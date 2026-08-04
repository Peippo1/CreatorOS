import { NextResponse } from "next/server";

import { requireViewer } from "@/lib/api/auth";
import { getStore } from "@/lib/storage";
import { recordBetaEvent } from "@/lib/analytics/events";
import { creatorProfileSchema } from "@/lib/types/product";

export async function GET() { const { viewer, response } = await requireViewer(); if (response) return response; return NextResponse.json({ profile: await getStore().getProfile(viewer!.id) }); }
export async function PUT(request: Request) { const { viewer, response } = await requireViewer(); if (response) return response; const profile = creatorProfileSchema.parse(await request.json()); const saved = await getStore().saveProfile(viewer!.id, profile); await recordBetaEvent(viewer!.id, "profile_saved"); return NextResponse.json({ profile: saved }); }
