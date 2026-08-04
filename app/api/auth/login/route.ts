import { NextResponse } from "next/server";

import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { email } = await request.json() as { email?: string };
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${new URL(request.url).origin}/auth/callback` } });
  if (error) return NextResponse.json({ error: "Could not send sign-in link." }, { status: 400 });
  return NextResponse.json({ message: "Check your email for a sign-in link." });
}
