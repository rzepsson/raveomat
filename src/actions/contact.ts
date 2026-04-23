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

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  topic: z.string().trim().min(3).max(180),
  message: z.string().trim().min(10).max(4_000),
  honeypot: honeypotSchema,
});

export const submitContact = defineAction({
  accept: "json",
  input: contactSchema,
  handler: async (input, context) => {
    guardHoneypot(input.honeypot);

    const clientIp = getSafeClientAddress(context.request, context.clientAddress);

    enforceRateLimit("contact:ip", getHashedIdentity(clientIp), {
      maxRequests: 5,
      windowMs: 15 * 60_000,
    });

    enforceRateLimit("contact:email", getHashedIdentity(input.email), {
      maxRequests: 4,
      windowMs: 60 * 60_000,
    });

    const { error } = await context.locals.supabase
      .from("contact_messages")
      .insert({
        name: input.name,
        email: input.email,
        topic: input.topic,
        message: input.message,
      });

    if (error) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Wystąpił błąd zapisu. Spróbuj ponownie.",
      });
    }

    return {
      success: true,
      message: "Wiadomość wysłana! Odpowiemy najszybciej jak to możliwe.",
    };
  },
});
