export type RuntimeConfiguration = {
  openaiConfigured: boolean;
  supabaseAuthConfigured: boolean;
  supabasePersistenceConfigured: boolean;
  turnstileConfigured: boolean;
  appOriginConfigured: boolean;
  storageMode: "supabase" | "memory";
  ready: boolean;
  missing: string[];
};

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

export function getSupabasePublicKey() {
  return env("NEXT_PUBLIC_SUPABASE_ANON_KEY") || env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

export function isSupabaseAuthConfigured() {
  return Boolean(env("NEXT_PUBLIC_SUPABASE_URL") && getSupabasePublicKey());
}

export function isSupabasePersistenceConfigured() {
  return isSupabaseAuthConfigured() && Boolean(env("SUPABASE_SERVICE_ROLE_KEY"));
}

export function getRuntimeConfiguration(): RuntimeConfiguration {
  const openaiConfigured = Boolean(env("OPENAI_API_KEY"));
  const supabaseAuthConfigured = isSupabaseAuthConfigured();
  const supabasePersistenceConfigured = isSupabasePersistenceConfigured();
  const turnstileConfigured = Boolean(env("NEXT_PUBLIC_TURNSTILE_SITE_KEY"));
  const appOriginConfigured = Boolean(env("APP_ORIGIN"));
  const production = process.env.NODE_ENV === "production";
  const missing = [
    !openaiConfigured && "OPENAI_API_KEY",
    !supabaseAuthConfigured && "SUPABASE_AUTH",
    !supabasePersistenceConfigured && "SUPABASE_PERSISTENCE",
    !turnstileConfigured && "TURNSTILE",
    !appOriginConfigured && "APP_ORIGIN",
  ].filter((item): item is string => Boolean(item));

  return {
    openaiConfigured,
    supabaseAuthConfigured,
    supabasePersistenceConfigured,
    turnstileConfigured,
    appOriginConfigured,
    storageMode: supabasePersistenceConfigured ? "supabase" : "memory",
    ready: !production || missing.length === 0,
    missing,
  };
}

export function isProductionPersistenceConfigured() {
  return process.env.NODE_ENV !== "production" || isSupabasePersistenceConfigured();
}
