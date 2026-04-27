import type { APIRoute } from "astro";
import { waitForCookieCommit } from "../../../lib/supabase.server";

export const GET: APIRoute = async ({ url, locals }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/?login=1" },
    });
  }

  const { error } = await locals.supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/?login=1" },
    });
  }

  await waitForCookieCommit();

  return new Response(null, {
    status: 302,
    headers: { Location: "/panel/bilety" },
  });
};
