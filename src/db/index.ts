import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

/**
 * Local development without any hosted database:
 *   DATABASE_URL=pglite://.pglite
 * runs an in-process Postgres (PGlite) stored in that folder and applies ./drizzle migrations.
 * Production should use a Neon URL.
 */
async function createLocalDb(dir: string): Promise<Db> {
  if (process.env.VERCEL) throw new Error("pglite:// DATABASE_URL is for local development only");
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(dir);
  const local = drizzlePglite(client, { schema });
  await migrate(local, { migrationsFolder: "./drizzle" });
  return local as unknown as Db;
}

const g = globalThis as unknown as { __pcDb?: Promise<Db> };

function getDb(): Promise<Db> {
  if (!g.__pcDb) {
    g.__pcDb = url!.startsWith("pglite:")
      ? createLocalDb(url!.slice("pglite://".length) || ".pglite")
      : Promise.resolve(drizzle(neon(url!), { schema }));
  }
  return g.__pcDb;
}

export const db: Db = await getDb();
