import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getSupabasePublicKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && getSupabasePublicKey());
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, getSupabasePublicKey()!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => { try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* Server Components cannot always mutate cookies. */ } },
    },
  });
}
