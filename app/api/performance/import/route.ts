import { NextResponse } from "next/server";

import { requireViewer } from "@/lib/api/auth";
import { parsePerformanceCsv } from "@/lib/metrics/csv";
import { getStore } from "@/lib/storage";

export async function POST(request: Request) {
  const { viewer, response } = await requireViewer();
  if (response) return response;
  const body = await request.text();
  if (body.length > 1_000_000) return NextResponse.json({ error: "CSV is too large." }, { status: 413 });
  const parsed = parsePerformanceCsv(body);
  const store = getStore();
  const experiments = await store.listExperiments(viewer!.id);
  const allowed = new Set(experiments.map((experiment) => experiment.id));
  const existing = await store.listPerformance(viewer!.id);
  const fingerprints = new Set(existing.map((item) => `${item.experimentId}:${item.publishedAt}`));
  let imported = 0;
  for (const row of parsed.rows) {
    const fingerprint = `${row.experimentId}:${row.publishedAt}`;
    if (!allowed.has(row.experimentId) || fingerprints.has(fingerprint)) continue;
    await store.addPerformance(viewer!.id, row);
    fingerprints.add(fingerprint);
    imported += 1;
  }
  return NextResponse.json({ imported, errors: parsed.errors, skipped: parsed.rows.length - imported });
}
