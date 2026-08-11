import { requireViewer } from "@/lib/api/auth";
import { jsonResponse } from "@/lib/api/request";
import { analysePerformance } from "@/lib/learning/analyse";
import { getStore } from "@/lib/storage";

export async function GET(request: Request) {
  const { viewer, response } = await requireViewer(request);
  if (response) return response;
  const store = getStore();
  const [experiments, snapshots] = await Promise.all([store.listExperiments(viewer!.id), store.listPerformance(viewer!.id)]);
  return jsonResponse({ insights: analysePerformance(experiments, snapshots), snapshotCount: snapshots.length });
}
