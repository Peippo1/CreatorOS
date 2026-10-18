import { expect, test } from "@playwright/test";

test.describe("deployment readiness", () => {
  test.skip(!process.env.E2E_BASE_URL, "Set E2E_BASE_URL to run preview/production readiness checks.");

  test("health endpoint is available", async ({ request }) => {
    const response = await request.get("/api/health");
    expect([200, 503]).toContain(response.status());
    expect(response.headers()["cache-control"]).toContain("no-store");
    const body = await response.json();
    expect(body).toMatchObject({ service: "creatoros" });
  });

  test("login endpoint validates input without exposing configuration", async ({ request }) => {
    const response = await request.post("/api/auth/login", { data: {} });
    expect([400, 503]).toContain(response.status());
    const body = await response.json();
    expect(JSON.stringify(body)).not.toMatch(/service.role|supabase\.co|api[_-]?key/i);
  });

  test("protected workspace does not expose anonymous workspace data", async ({ request }) => {
    const response = await request.get("/workspace", { maxRedirects: 0 });
    expect([302, 307, 308]).toContain(response.status());
    expect(response.headers().location).toMatch(/login|vercel\.com\/sso-api/);
  });
});
