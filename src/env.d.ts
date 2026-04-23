/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly RATE_LIMIT_DRIVER?: "memory" | "redis";
  readonly UPSTASH_REDIS_REST_URL?: string;
  readonly UPSTASH_REDIS_REST_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: import("@supabase/supabase-js").User | null;
    session: import("@supabase/supabase-js").Session | null;
    supabase: import("@supabase/supabase-js").SupabaseClient;
  }
}
