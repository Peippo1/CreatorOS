import { NextResponse } from "next/server";

import { getAppOrigin } from "@/lib/app-origin";
import { checkLoginRateLimit } from "@/app/api/generate/rate-limit";
import { isTurnstileConfigured, isTurnstileRequired, isValidTurnstileToken } from "@/lib/auth/captcha";
import { parseJsonBody, RequestBodyTooLargeError, MalformedJsonRequestError, sameOriginResponse, jsonResponse, safeNextPath } from "@/lib/api/request";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const originResponse = sameOriginResponse(request);
  if (originResponse) return originResponse;

  const requestId = crypto.randomUUID();
  if (!isSupabaseConfigured()) return jsonResponse({ error: "Supabase is not configured." }, { status: 503, headers: { "X-Request-ID": requestId } });
  const turnstileRequired = isTurnstileRequired();
  if (turnstileRequired && !isTurnstileConfigured()) {
    return jsonResponse({ error: "CAPTCHA protection is not configured." }, { status: 503, headers: { "X-Request-ID": requestId } });
  }

  let body: { email?: unknown; captchaToken?: unknown; next?: unknown };
  try {
    body = await parseJsonBody(request) as { email?: unknown; captchaToken?: unknown; next?: unknown };
  } catch (error) {
    return jsonResponse(
      { error: error instanceof RequestBodyTooLargeError ? "Request body is too large." : "Enter a valid email address." },
      { status: error instanceof RequestBodyTooLargeError ? 413 : 400, headers: { "X-Request-ID": requestId } },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 320 || !email.includes("@")) {
    return jsonResponse({ error: "Enter a valid email address." }, { status: 400, headers: { "X-Request-ID": requestId } });
  }
  const submittedCaptchaToken = body.captchaToken;
  if (turnstileRequired && !isValidTurnstileToken(submittedCaptchaToken)) {
    return jsonResponse({ error: "Complete the verification to continue." }, { status: 400, headers: { "X-Request-ID": requestId } });
  }

  const rateLimit = await checkLoginRateLimit(request, Date.now(), requestId);
  if (rateLimit.outcome === "limited") {
    return jsonResponse(
      { error: "Too many sign-in requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds), "X-Request-ID": requestId } },
    );
  }
  if (rateLimit.outcome === "unavailable") {
    return jsonResponse({ error: "Sign-in service is temporarily unavailable. Please try again later." }, { status: 503, headers: { "X-Request-ID": requestId } });
  }

  const nextPath = safeNextPath(request, typeof body.next === "string" ? body.next : null);
  const captchaToken = isValidTurnstileToken(submittedCaptchaToken) ? submittedCaptchaToken : undefined;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getAppOrigin(request)}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      shouldCreateUser: false,
      ...(turnstileRequired ? { captchaToken: captchaToken! } : {}),
    },
  });
  if (error) return jsonResponse({ error: "Could not send sign-in link." }, { status: 400, headers: { "X-Request-ID": requestId } });
  return jsonResponse({ message: "Check your email for a sign-in link." }, { headers: { "X-Request-ID": requestId } });
}
