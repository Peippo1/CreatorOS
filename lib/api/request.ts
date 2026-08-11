import { NextResponse } from "next/server";

import { getAppOrigin } from "@/lib/app-origin";

const DEFAULT_MAX_JSON_BYTES = 100_000;

export class MalformedJsonRequestError extends Error {
  constructor() {
    super("Malformed JSON request.");
    this.name = "MalformedJsonRequestError";
  }
}

export class RequestBodyTooLargeError extends Error {
  constructor() {
    super("Request body is too large.");
    this.name = "RequestBodyTooLargeError";
  }
}

export async function parseJsonBody(request: Request, maxBytes = DEFAULT_MAX_JSON_BYTES): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new RequestBodyTooLargeError();
  }

  try {
    const body = await request.text();
    if (!body.trim()) throw new MalformedJsonRequestError();
    if (new TextEncoder().encode(body).byteLength > maxBytes) {
      throw new RequestBodyTooLargeError();
    }
    return JSON.parse(body);
  } catch (error) {
    if (error instanceof MalformedJsonRequestError || error instanceof RequestBodyTooLargeError) {
      throw error;
    }
    throw new MalformedJsonRequestError();
  }
}

export function sameOriginResponse(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  try {
    if (new URL(origin).origin !== getAppOrigin(request)) {
      return jsonResponse({ error: "Cross-origin request rejected." }, { status: 403 });
    }
  } catch {
    return jsonResponse({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  return null;
}

export function jsonResponse(body: Record<string, unknown>, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(body, { ...init, headers });
}

export function safeNextPath(request: Request, value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/workspace";

  try {
    const candidate = new URL(value, getAppOrigin(request));
    return candidate.origin === getAppOrigin(request) ? `${candidate.pathname}${candidate.search}${candidate.hash}` : "/workspace";
  } catch {
    return "/workspace";
  }
}
