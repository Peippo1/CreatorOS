import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type Viewer = { id: string; email: string; demo: boolean };

export async function getViewer(): Promise<Viewer | null> {
  if (!isSupabaseConfigured()) return { id: "demo-user", email: "demo@creatoros.local", demo: true };
  const { data } = await (await createSupabaseServerClient()).auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "", demo: false };
}
