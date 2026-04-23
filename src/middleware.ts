import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase.server";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.cookies);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.supabase = supabase;
  context.locals.user = user;
  context.locals.session = null;

  if (context.url.pathname.startsWith("/panel") && !user) {
    return context.redirect("/?login=1");
  }

  return next();
});
