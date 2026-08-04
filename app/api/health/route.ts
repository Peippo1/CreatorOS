import { NextResponse } from "next/server";

import { hasOpenAIKey, isProductionEnvironment } from "@/lib/openai/config";

export const runtime = "nodejs";

export function GET() {
  const configured = hasOpenAIKey();
  const ready = !isProductionEnvironment() || configured;

  return NextResponse.json(
    {
      status: ready ? "ok" : "not_configured",
      service: "creatoros",
      configured,
    },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
