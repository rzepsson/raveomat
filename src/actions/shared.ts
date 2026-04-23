import { ActionError } from "astro:actions";
import { z } from "astro/zod";
import { checkRateLimit, getClientIp, hashIdentifier } from "../lib/security/rate-limit";

export const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());

export const honeypotSchema = z.string().trim().max(0).optional().default("");

export async function enforceRateLimit(
  bucket: string,
  identity: string,
  options: { maxRequests: number; windowMs: number }
): Promise<void> {
  const decision = await checkRateLimit(bucket, identity, options);

  if (!decision.allowed) {
    throw new ActionError({
      code: "TOO_MANY_REQUESTS",
      message: `Zbyt wiele prób. Spróbuj ponownie za ${decision.retryAfterSeconds}s.`,
    });
  }
}

export function getSafeClientAddress(request: Request, fallbackAddress: string | undefined): string {
  return getClientIp(request.headers, fallbackAddress);
}

export function getHashedIdentity(rawValue: string): string {
  return hashIdentifier(rawValue);
}

export function guardHoneypot(honeypotValue: string): void {
  if (!honeypotValue.trim()) return;

  throw new ActionError({
    code: "FORBIDDEN",
    message: "Nie udało się przetworzyć żądania.",
  });
}
