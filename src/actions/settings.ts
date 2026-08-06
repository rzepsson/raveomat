import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import {
  enforceRateLimit,
  getHashedIdentity,
} from "./shared";
import { waitForCookieCommit } from "../lib/supabase.server";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Imię musi mieć co najmniej 2 znaki.").max(120),
  phone: z.string().trim().max(30).nullable().default(null),
  city: z.string().trim().max(100).nullable().default(null),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Podaj obecne hasło."),
  newPassword: z.string().min(8, "Nowe hasło musi mieć co najmniej 8 znaków.").max(128),
});

function requireUser(context: { locals: App.Locals }) {
  const user = context.locals.user;
  if (!user) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Musisz być zalogowany.",
    });
  }
  return user;
}

function getAuthProvider(user: NonNullable<App.Locals["user"]>): string {
  const providers = user.app_metadata?.providers;
  if (!Array.isArray(providers)) return "email";
  if (providers.includes("google")) return "google";
  if (providers.includes("apple")) return "apple";
  return "email";
}

export const updateProfile = defineAction({
  accept: "json",
  input: profileSchema,
  handler: async (input, context) => {
    const user = requireUser(context);

    await enforceRateLimit(
      "settings:profile",
      getHashedIdentity(user.id),
      { maxRequests: 10, windowMs: 15 * 60_000 },
    );

    const { error } = await context.locals.supabase
      .from("profiles")
      .update({
        full_name: input.fullName,
        phone: input.phone,
        city: input.city,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Nie udało się zaktualizować profilu.",
      });
    }

    return { success: true };
  },
});

export const changePassword = defineAction({
  accept: "json",
  input: changePasswordSchema,
  handler: async (input, context) => {
    const user = requireUser(context);

    await enforceRateLimit(
      "settings:password",
      getHashedIdentity(user.id),
      { maxRequests: 5, windowMs: 15 * 60_000 },
    );

    const email = user.email;
    if (!email) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "Brak adresu email powiązanego z kontem.",
      });
    }

    const provider = getAuthProvider(user);
    if (provider === "google" || provider === "apple") {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "Konta OAuth zarządzają hasłem przez dostawcę logowania.",
      });
    }

    if (input.currentPassword === input.newPassword) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "Nowe hasło musi różnić się od obecnego.",
      });
    }

    const { error: signInError } = await context.locals.supabase.auth.signInWithPassword({
      email,
      password: input.currentPassword,
    });

    if (signInError) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Obecne hasło jest nieprawidłowe.",
      });
    }

    const { error: updateError } = await context.locals.supabase.auth.updateUser({
      password: input.newPassword,
    });

    if (updateError) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Nie udało się zmienić hasła. Spróbuj ponownie.",
      });
    }

    await waitForCookieCommit();

    return { success: true };
  },
});

export const sendPasswordReset = defineAction({
  accept: "json",
  input: z.object({}),
  handler: async (_, context) => {
    const user = requireUser(context);

    await enforceRateLimit(
      "settings:reset",
      getHashedIdentity(user.id),
      { maxRequests: 3, windowMs: 60 * 60_000 },
    );

    const email = user.email;
    if (!email) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "Brak adresu email powiązanego z kontem.",
      });
    }

    const redirectTo = context.url
      ? `${context.url.origin}/api/auth/callback`
      : undefined;

    const { error } = await context.locals.supabase.auth.resetPasswordForEmail(email, {
      ...(redirectTo ? { redirectTo } : undefined),
    });

    if (error) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Nie udało się wysłać emaila z linkiem resetującym.",
      });
    }

    return { success: true };
  },
});
