import { NextResponse } from "next/server";

import { getViewer } from "@/lib/auth/viewer";

export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer) return { viewer: null, response: NextResponse.json({ error: "Sign in to use your CreatorOS workspace." }, { status: 401 }) };
  return { viewer, response: null };
}
