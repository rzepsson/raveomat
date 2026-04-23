import type { APIRoute } from "astro";

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

  return new Response(null, {
    status: 302,
    headers: { Location: "/panel/bilety" },
  });
};
