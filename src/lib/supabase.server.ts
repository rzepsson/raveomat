import { createServerClient } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";

function parseCookieHeader(header: string): Array<{ name: string; value: string }> {
  if (!header) return [];
  return header.split(";").map((pair) => {
    const eqIndex = pair.indexOf("=");
    const name = pair.substring(0, eqIndex).trim();
    const value = pair.substring(eqIndex + 1).trim();
    return { name, value };
  });
}

export function createSupabaseServerClient(
  cookies: AstroCookies,
  rawCookieHeader?: string,
  responseHeaders?: Map<string, string>,
): SupabaseClient {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY environment variables");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(rawCookieHeader ?? "");
      },
      setAll(
        toSet: Array<{ name: string; value: string; options: Record<string, unknown> }>,
        headers: Record<string, string>,
      ) {
        for (const { name, value, options } of toSet) {
          const { name: _name, ...cookieOpts } = options as Record<string, unknown> & {
            name?: string;
          };
          cookies.set(name, value, cookieOpts);
        }
        if (responseHeaders) {
          for (const [key, val] of Object.entries(headers)) {
            responseHeaders.set(key, val);
          }
        }
      },
    },
  });
}

export async function waitForCookieCommit(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
