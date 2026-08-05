import { NextResponse } from "next/server";

import { getAppOrigin } from "@/lib/app-origin";
import { checkLoginRateLimit } from "@/app/api/generate/rate-limit";
import { isTurnstileConfigured, isTurnstileRequired, isValidTurnstileToken } from "@/lib/auth/captcha";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const turnstileRequired = isTurnstileRequired();
  if (turnstileRequired && !isTurnstileConfigured()) {
    return NextResponse.json({ error: "CAPTCHA protection is not configured." }, { status: 503 });
  }
  const rateLimit = await checkLoginRateLimit(request);
  if (!rateLimit.allowed) return NextResponse.json(
    { error: "Too many sign-in requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds), "Cache-Control": "no-store" } },
  );

  let email: string | undefined;
  let submittedCaptchaToken: unknown;
  try {
    ({ email, captchaToken: submittedCaptchaToken } = await request.json() as { email?: string; captchaToken?: unknown });
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  email = email?.trim().toLowerCase();
  if (!email || email.length > 320 || !email.includes("@")) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (turnstileRequired && !isValidTurnstileToken(submittedCaptchaToken)) {
    return NextResponse.json({ error: "Complete the verification to continue." }, { status: 400 });
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
  if (error) return NextResponse.json({ error: "Could not send sign-in link." }, { status: 400 });
  return NextResponse.json({ message: "Check your email for a sign-in link." });
}
