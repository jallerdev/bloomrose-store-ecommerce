import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.NEWSLETTER_SECRET;

if (!SECRET && process.env.NODE_ENV === "production") {
  // Si esto se lanza en build/prod, el deploy debe fallar — un secret
  // débil rompería la seguridad del link de unsubscribe.
  throw new Error("NEWSLETTER_SECRET is required in production");
}

const KEY = SECRET ?? "dev-secret-do-not-use-in-prod";

export function signEmail(email: string): string {
  const normalized = email.toLowerCase().trim();
  return createHmac("sha256", KEY).update(normalized).digest("hex").slice(0, 32);
}

export function verifyToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expected = signEmail(email);
  if (expected.length !== token.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function buildUnsubscribeUrl(siteUrl: string, email: string): string {
  const token = signEmail(email);
  const params = new URLSearchParams({ email, token });
  return `${siteUrl}/newsletter/unsubscribe?${params.toString()}`;
}
