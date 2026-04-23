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

const newsletterSchema = z.object({
  email: emailSchema,
  honeypot: honeypotSchema,
});

export const submitNewsletter = defineAction({
  accept: "json",
  input: newsletterSchema,
  handler: async (input, context) => {
    guardHoneypot(input.honeypot);

    const clientIp = getSafeClientAddress(context.request, context.clientAddress);

    enforceRateLimit("newsletter:ip", getHashedIdentity(clientIp), {
      maxRequests: 8,
      windowMs: 15 * 60_000,
    });

    enforceRateLimit("newsletter:email", getHashedIdentity(input.email), {
      maxRequests: 3,
      windowMs: 60 * 60_000,
    });

    const { error } = await context.locals.supabase
      .from("newsletter_subscribers")
      .insert({ email: input.email });

    if (error) {
      if (error.code === "23505") {
        throw new ActionError({
          code: "CONFLICT",
          message: "Ten adres email jest już zapisany.",
        });
      }

      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Wystąpił błąd zapisu. Spróbuj ponownie.",
      });
    }

    return {
      success: true,
      message: "Zapisano! Będziemy Cię informować o nowych wydarzeniach.",
    };
  },
});
