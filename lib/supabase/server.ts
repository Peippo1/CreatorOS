import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicKey as getRuntimeSupabasePublicKey, isSupabaseAuthConfigured } from "@/lib/config/runtime";

export function getSupabasePublicKey() {
  return getRuntimeSupabasePublicKey();
}

export function isSupabaseConfigured() {
  return isSupabaseAuthConfigured();
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
