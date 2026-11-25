import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzleProxy } from "drizzle-orm/pg-proxy";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

type LocalClient = {
  client: import("@electric-sql/pglite").PGlite;
  parsers: Record<number, (v: string) => string>;
};
const g = globalThis as unknown as { __pcLocal?: Promise<LocalClient> };

/**
 * Local development without any hosted database:
 *   DATABASE_URL=pglite://.pglite
 * runs an in-process Postgres (PGlite) stored in that folder and applies ./drizzle migrations.
 * Production must use a Neon URL.
 *
 * The data folder is opened LAZILY on the first query, never at import time. Next.js imports
 * route modules in extra worker processes (e.g. to collect static paths), and PGlite allows only
 * one process per folder, so opening at import corrupted the first-run migration.
 */
function openLocal(dir: string): Promise<LocalClient> {
  if (!g.__pcLocal) {
    g.__pcLocal = (async () => {
      if (process.env.VERCEL) throw new Error("pglite:// DATABASE_URL is for local development only");
      const { PGlite, types } = await import("@electric-sql/pglite");
      const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
      const { migrate } = await import("drizzle-orm/pglite/migrator");
      const client = new PGlite(dir);
      await client.waitReady;
      await migrate(drizzlePglite(client), { migrationsFolder: "./drizzle" });
      // Return date/time columns as raw strings, as drizzle's own pglite driver does.
      const raw = (v: string) => v;
      const parsers = { [types.TIMESTAMP]: raw, [types.TIMESTAMPTZ]: raw, [types.INTERVAL]: raw, [types.DATE]: raw };
      return { client, parsers };
    })();
    g.__pcLocal.catch(() => {
      g.__pcLocal = undefined; // let the next query retry instead of caching a failure
    });
  }
  return g.__pcLocal;
}

function createDb(): Db {
  if (url!.startsWith("pglite:")) {
    const dir = url!.slice("pglite://".length) || ".pglite";
    return drizzleProxy(
      async (sqlText, params, method) => {
        const { client, parsers } = await openLocal(dir);
        const res = await client.query(sqlText, params, {
          rowMode: method === "all" ? "array" : "object",
          parsers,
        });
        return { rows: res.rows as never[] };
      },
      { schema },
    ) as unknown as Db;
  }
  return drizzle(neon(url!), { schema });
}

export const db: Db = createDb();
