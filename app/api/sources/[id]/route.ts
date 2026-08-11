import { NextResponse } from "next/server";

import { requireViewer } from "@/lib/api/auth";
import { jsonResponse } from "@/lib/api/request";
import { getStore } from "@/lib/storage";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { viewer, response } = await requireViewer(request, { stateChanging: true });
  if (response) return response;
  const deleted = await getStore().deleteSource(viewer!.id, (await params).id);
  return deleted ? new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } }) : jsonResponse({ error: "Source not found." }, { status: 404 });
}
