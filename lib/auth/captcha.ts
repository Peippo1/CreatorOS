const CAPTCHA_TOKEN_MAX_LENGTH = 2_048;

export function isTurnstileConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export function isTurnstileRequired() {
  // A production deployment must never silently accept a sign-in request if
  // CAPTCHA configuration was omitted. Local development remains frictionless.
  return process.env.NODE_ENV === "production" || isTurnstileConfigured();
}

export function isValidTurnstileToken(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= CAPTCHA_TOKEN_MAX_LENGTH;
}
