import { afterEach, describe, expect, it } from "vitest";

import { getSupabasePublicKey, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  isProductionPersistenceConfigured,
  isSupabaseAuthConfigured,
  isSupabasePersistenceConfigured,
} from "@/lib/config/runtime";

const environmentNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NODE_ENV",
] as const;
const originalEnvironment = Object.fromEntries(environmentNames.map((name) => [name, process.env[name]]));

function restore(name: typeof environmentNames[number], value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

afterEach(() => {
  for (const name of environmentNames) restore(name, originalEnvironment[name]);
});

describe("Supabase server configuration", () => {
  it("uses the publishable key when the legacy anon key is blank", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://creator.example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = " sb_publishable_test ";

    expect(getSupabasePublicKey()).toBe("sb_publishable_test");
    expect(isSupabaseConfigured()).toBe(true);
    expect(isSupabaseAuthConfigured()).toBe(true);
  });

  it("treats blank public keys as missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://creator.example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = " ";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(getSupabasePublicKey()).toBe("");
    expect(isSupabaseConfigured()).toBe(false);
    expect(isSupabasePersistenceConfigured()).toBe(false);
  });

  it("requires the service-role key for production persistence", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://creator.example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.NODE_ENV = "production";

    expect(isProductionPersistenceConfigured()).toBe(false);

    process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_test";
    expect(isSupabasePersistenceConfigured()).toBe(true);
    expect(isProductionPersistenceConfigured()).toBe(true);
  });
});
