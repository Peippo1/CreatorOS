import { NextResponse } from "next/server";

import { getAppOrigin } from "@/lib/app-origin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/api/request";

function callbackError(request: Request, nextPath: string) {
  const login = new URL("/login", getAppOrigin(request));
  login.searchParams.set("error", "auth_callback_failed");
  if (nextPath !== "/workspace") login.searchParams.set("next", nextPath);
  return NextResponse.redirect(login);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = safeNextPath(request, url.searchParams.get("next"));
  const code = url.searchParams.get("code");

  if (!code) return callbackError(request, nextPath);

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return callbackError(request, nextPath);
  } catch {
    return callbackError(request, nextPath);
  }

  return NextResponse.redirect(new URL(nextPath, getAppOrigin(request)));
}
