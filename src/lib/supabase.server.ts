import { createServerClient } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";

interface CookieOptions {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  [key: string]: unknown;
}

export function createSupabaseServerClient(cookies: AstroCookies): SupabaseClient {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY environment variables");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        const { name: _name, ...cookieOpts } = options as CookieOptions & { name?: string };
        cookies.set(name, value, cookieOpts);
      },
      remove(name: string, options: CookieOptions) {
        const { name: _name, ...cookieOpts } = options as CookieOptions & { name?: string };
        cookies.delete(name, cookieOpts);
      },
    },
  });
}
