import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth/viewer";
import { isProductionPersistenceConfigured } from "@/lib/config/runtime";

export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer) return { viewer: null, response: NextResponse.json({ error: "Sign in to use your CreatorOS workspace." }, { status: 401 }) };
  if (!isProductionPersistenceConfigured()) return { viewer: null, response: NextResponse.json({ error: "CreatorOS persistence is not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } }) };
  return { viewer, response: null };
}
