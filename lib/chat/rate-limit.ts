/**
 * Rate limiter en memoria muy simple (sliding window por IP).
 * Suficiente para un MVP single-instance. Para producción multi-instancia
 * reemplazar con Upstash Redis o Supabase + tabla de rate-limits.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

interface Result {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  options: { max: number; windowMs: number } = { max: 10, windowMs: 60_000 },
): Result {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + options.windowMs };
    buckets.set(key, fresh);
    return {
      allowed: true,
      remaining: options.max - 1,
      resetAt: fresh.resetAt,
    };
  }

  if (existing.count >= options.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return {
    allowed: true,
    remaining: options.max - existing.count,
    resetAt: existing.resetAt,
  };
}
