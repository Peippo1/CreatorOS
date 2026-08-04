import { NextResponse } from "next/server";

import { requireViewer } from "@/lib/api/auth";
import { getStore } from "@/lib/storage";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { viewer, response } = await requireViewer();
  if (response) return response;
  const deleted = await getStore().deleteSource(viewer!.id, (await params).id);
  return deleted ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Source not found." }, { status: 404 });
}
