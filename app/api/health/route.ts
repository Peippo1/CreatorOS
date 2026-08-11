import { NextResponse } from "next/server";

import { getRuntimeConfiguration } from "@/lib/config/runtime";

export const runtime = "nodejs";

export function GET() {
  const configuration = getRuntimeConfiguration();

  return NextResponse.json(
    {
      status: configuration.ready ? "ok" : "not_configured",
      service: "creatoros",
      configured: configuration.openaiConfigured,
      ...configuration,
    },
    {
      status: configuration.ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
