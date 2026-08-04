import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function isPublicApi(pathname: string) {
  return pathname === "/api/health" || pathname === "/api/auth/login";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/") && isPublicApi(pathname)) return NextResponse.next();

  // Local demos remain frictionless, but a misconfigured production deployment
  // never exposes the app as an anonymous demo workspace.
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") return unauthenticatedResponse(request);
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user ? response : unauthenticatedResponse(request);
}

function unauthenticatedResponse(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Sign in to use your CreatorOS workspace." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/workspace/:path*", "/generate/:path*", "/api/:path*"],
};
