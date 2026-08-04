import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";

const originalEnvironment = process.env.NODE_ENV;
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function setEnvironment(value: string | undefined) {
  Object.assign(process.env, { NODE_ENV: value });
}

function restore(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

afterEach(() => {
  setEnvironment(originalEnvironment);
  restore("NEXT_PUBLIC_SUPABASE_URL", originalSupabaseUrl);
  restore("NEXT_PUBLIC_SUPABASE_ANON_KEY", originalSupabaseKey);
});

describe("beta auth proxy", () => {
  it("keeps local demos usable when Supabase is absent", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setEnvironment("test");

    const response = await proxy(new NextRequest("http://localhost/generate"));

    expect(response.status).toBe(200);
  });

  it("fails closed for protected pages when production auth is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setEnvironment("production");

    const response = await proxy(new NextRequest("https://creator.example/generate"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://creator.example/login?next=%2Fgenerate");
  });

  it("returns a safe 401 for protected APIs when production auth is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setEnvironment("production");

    const response = await proxy(new NextRequest("https://creator.example/api/generate"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Sign in to use your CreatorOS workspace." });
  });
});
