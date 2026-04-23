import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import {
  emailSchema,
  enforceRateLimit,
  getHashedIdentity,
  getSafeClientAddress,
  guardHoneypot,
  honeypotSchema,
} from "./shared";

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
  honeypot: honeypotSchema,
});

const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
  fullName: z.string().trim().min(2).max(120),
  honeypot: honeypotSchema,
});

export const login = defineAction({
  accept: "json",
  input: loginSchema,
  handler: async (input, context) => {
    guardHoneypot(input.honeypot);

    const clientIp = getSafeClientAddress(context.request, context.clientAddress);

    await enforceRateLimit("auth:login:ip", getHashedIdentity(clientIp), {
      maxRequests: 10,
      windowMs: 15 * 60_000,
    });

    await enforceRateLimit("auth:login:email", getHashedIdentity(input.email), {
      maxRequests: 5,
      windowMs: 15 * 60_000,
    });

    const { data, error } = await context.locals.supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Nieprawidłowy email lub hasło.",
      });
    }

    return {
      success: true,
      user: { id: data.user.id, email: data.user.email ?? "" },
    };
  },
});

export const register = defineAction({
  accept: "json",
  input: registerSchema,
  handler: async (input, context) => {
    guardHoneypot(input.honeypot);

    const clientIp = getSafeClientAddress(context.request, context.clientAddress);

    await enforceRateLimit("auth:register:ip", getHashedIdentity(clientIp), {
      maxRequests: 5,
      windowMs: 60 * 60_000,
    });

    const { error } = await context.locals.supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
        },
      },
    });

    if (error) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: error.message,
      });
    }

    return {
      success: true,
      message: "Sprawdź skrzynkę email, aby potwierdzić rejestrację.",
    };
  },
});

export const logout = defineAction({
  accept: "json",
  input: z.object({}),
  handler: async (_, context) => {
    const { error } = await context.locals.supabase.auth.signOut();

    if (error) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Wystąpił błąd podczas wylogowywania.",
      });
    }

    return { success: true };
  },
});
