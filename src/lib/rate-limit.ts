import { sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";

/**
 * Postgres-backed daily counter. Atomically increments and reports whether
 * the caller is still within `limit` for today (UTC).
 */
export async function checkRateLimit(key: string, limit: number) {
  const today = new Date().toISOString().slice(0, 10);
  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart: today, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });
  return { allowed: row.count <= limit, remaining: Math.max(0, limit - row.count) };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
