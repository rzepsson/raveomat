import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  const { email, password, fullName } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email i hasło są wymagane." }), { status: 400 });
  }

  const { error } = await locals.supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
