import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession: mocks.exchangeCodeForSession },
  })),
}));

import { GET as callbackGET } from "@/app/auth/callback/route";
import { MalformedJsonRequestError, parseJsonBody, safeNextPath, sameOriginResponse } from "@/lib/api/request";

const originalAppOrigin = process.env.APP_ORIGIN;

afterEach(() => {
  mocks.exchangeCodeForSession.mockReset();
  if (originalAppOrigin === undefined) delete process.env.APP_ORIGIN;
  else process.env.APP_ORIGIN = originalAppOrigin;
});

describe("request security", () => {
  it("rejects malformed JSON as a typed client error", async () => {
    await expect(parseJsonBody(new Request("https://creator.example/api/profile", { method: "PUT", body: "{" }))).rejects.toBeInstanceOf(MalformedJsonRequestError);
  });

  it("rejects cross-origin state-changing requests", () => {
    process.env.APP_ORIGIN = "https://creator.example";
    const response = sameOriginResponse(new Request("https://creator.example/api/profile", { method: "PUT", headers: { origin: "https://evil.example" } }));
    expect(response?.status).toBe(403);
  });

  it("allows same-origin requests and rejects open redirect destinations", () => {
    process.env.APP_ORIGIN = "https://creator.example";
    expect(sameOriginResponse(new Request("https://creator.example/api/profile", { method: "PUT", headers: { origin: "https://creator.example" } }))).toBeNull();
    expect(safeNextPath(new Request("https://creator.example/auth/callback"), "https://evil.example")).toBe("/workspace");
    expect(safeNextPath(new Request("https://creator.example/auth/callback"), "/generate?tab=experiments")).toBe("/generate?tab=experiments");
  });

  it("redirects failed auth callbacks to a safe, understandable login state", async () => {
    process.env.APP_ORIGIN = "https://creator.example";
    mocks.exchangeCodeForSession.mockResolvedValue({ error: new Error("expired") });

    const response = await callbackGET(new Request("https://creator.example/auth/callback?code=expired&next=https%3A%2F%2Fevil.example"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://creator.example/login?error=auth_callback_failed");
  });

  it("preserves a valid internal destination after a successful callback", async () => {
    process.env.APP_ORIGIN = "https://creator.example";
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await callbackGET(new Request("https://creator.example/auth/callback?code=valid&next=%2Fgenerate"));
    expect(response.headers.get("location")).toBe("https://creator.example/generate");
  });
});
