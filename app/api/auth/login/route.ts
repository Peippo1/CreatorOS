import { NextResponse } from "next/server";

import { getAppOrigin } from "@/lib/app-origin";
import { checkLoginRateLimit } from "@/app/api/generate/rate-limit";
import { isTurnstileConfigured, isTurnstileRequired, isValidTurnstileToken } from "@/lib/auth/captcha";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  if (!isSupabaseConfigured()) return jsonResponse({ error: "Supabase is not configured." }, 503, requestId);
  const turnstileRequired = isTurnstileRequired();
  if (turnstileRequired && !isTurnstileConfigured()) {
    return jsonResponse({ error: "CAPTCHA protection is not configured." }, 503, requestId);
  }

  let email: string | undefined;
  let submittedCaptchaToken: unknown;
  try {
    ({ email, captchaToken: submittedCaptchaToken } = await request.json() as { email?: string; captchaToken?: unknown });
  } catch {
    return jsonResponse({ error: "Enter a valid email address." }, 400, requestId);
  }
  email = email?.trim().toLowerCase();
  if (!email || email.length > 320 || !email.includes("@")) {
    return jsonResponse({ error: "Enter a valid email address." }, 400, requestId);
  }
  if (turnstileRequired && !isValidTurnstileToken(submittedCaptchaToken)) {
    return jsonResponse({ error: "Complete the verification to continue." }, 400, requestId);
  }

  const rateLimit = await checkLoginRateLimit(request, Date.now(), requestId);
  if (rateLimit.outcome === "limited") {
    return jsonResponse(
      { error: "Too many sign-in requests. Please try again later." },
      429,
      requestId,
      rateLimit.retryAfterSeconds,
    );
  }
  if (rateLimit.outcome === "unavailable") {
    return jsonResponse(
      { error: "Sign-in service is temporarily unavailable. Please try again later." },
      503,
      requestId,
    );
  }

  const captchaToken = isValidTurnstileToken(submittedCaptchaToken) ? submittedCaptchaToken : undefined;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getAppOrigin(request)}/auth/callback`,
      // CreatorOS is invite-only during beta: only users created in Supabase
      // can receive a sign-in link, preventing public self-registration.
      shouldCreateUser: false,
      ...(turnstileRequired ? { captchaToken: captchaToken! } : {}),
    },
  });
  if (error) return jsonResponse({ error: "Could not send sign-in link." }, 400, requestId);
  return jsonResponse({ message: "Check your email for a sign-in link." }, 200, requestId);
}

function jsonResponse(body: Record<string, unknown>, status: number, requestId: string, retryAfterSeconds?: number) {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Request-ID": requestId,
  });
  if (retryAfterSeconds !== undefined) headers.set("Retry-After", String(retryAfterSeconds));
  return NextResponse.json(body, { status, headers });
}
