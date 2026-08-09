import { afterEach, describe, expect, it } from "vitest";

import { getSupabasePublicKey, isSupabaseConfigured } from "@/lib/supabase/server";

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const originalSupabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function restore(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

afterEach(() => {
  restore("NEXT_PUBLIC_SUPABASE_URL", originalSupabaseUrl);
  restore("NEXT_PUBLIC_SUPABASE_ANON_KEY", originalSupabaseAnonKey);
  restore("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", originalSupabasePublishableKey);
});

describe("Supabase server configuration", () => {
  it("uses the publishable key when the legacy anon key is blank", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://creator.example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = " sb_publishable_test ";

    expect(getSupabasePublicKey()).toBe("sb_publishable_test");
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("treats blank public keys as missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://creator.example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = " ";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "";

    expect(getSupabasePublicKey()).toBe("");
    expect(isSupabaseConfigured()).toBe(false);
  });
});
