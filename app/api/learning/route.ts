import { NextResponse } from "next/server";

import { requireViewer } from "@/lib/api/auth";
import { analysePerformance } from "@/lib/learning/analyse";
import { getStore } from "@/lib/storage";

export async function GET() { const { viewer, response } = await requireViewer(); if (response) return response; const store = getStore(); const [experiments, snapshots] = await Promise.all([store.listExperiments(viewer!.id), store.listPerformance(viewer!.id)]); return NextResponse.json({ insights: analysePerformance(experiments, snapshots), snapshotCount: snapshots.length }); }
