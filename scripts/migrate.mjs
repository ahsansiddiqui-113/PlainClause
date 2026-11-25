// Applies ./drizzle migrations to the production database during a Vercel production build.
// Skips everywhere else (local dev, previews, PGlite) so only real production deploys touch the DB.
// Migrations already applied are tracked by drizzle and skipped, so this is safe to run every deploy.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL;
if (process.env.VERCEL_ENV !== "production") {
  console.log(`[migrate] skipped (VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"})`);
  process.exit(0);
}
if (!url || url.startsWith("pglite:")) {
  console.error("[migrate] DATABASE_URL is missing or not a Postgres URL; refusing to deploy to production.");
  process.exit(1);
}

try {
  await migrate(drizzle(neon(url)), { migrationsFolder: "./drizzle" });
  console.log("[migrate] database is up to date");
} catch (e) {
  console.error("[migrate] failed:", e instanceof Error ? e.message : e);
  process.exit(1);
}
