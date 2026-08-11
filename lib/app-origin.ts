/**
 * Uses a configured canonical URL in production so authentication redirects
 * cannot be influenced by an untrusted Host header.
 */
export function getAppOrigin(request: Request) {
  const configuredOrigin = process.env.APP_ORIGIN;

  if (configuredOrigin) return new URL(configuredOrigin).origin;
  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_ORIGIN must be configured in production.");
  }

  return new URL(request.url).origin;
}
