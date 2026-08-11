import { NextResponse } from "next/server";

import { requireViewer } from "@/lib/api/auth";
import { getStore } from "@/lib/storage";

export async function GET(request: Request) {
  const { viewer, response } = await requireViewer(request);
  if (response) return response;
  const store = getStore();
  const [profile, sources, experiments, performance, events] = await Promise.all([store.getProfile(viewer!.id), store.listSources(viewer!.id), store.listExperiments(viewer!.id), store.listPerformance(viewer!.id), store.listEvents(viewer!.id)]);
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), profile, sources, experiments, performance, events }), { headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="creatoros-export.json"', "Cache-Control": "no-store" } });
}
