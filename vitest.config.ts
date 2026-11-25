import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": r("./src"),
      // `server-only` throws outside the Next server bundle; tests run in plain Node.
      "server-only": r("./tests/server-only-stub.ts"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    env: {
      // In-memory Postgres so modules that import the db client load without a real database.
      DATABASE_URL: "pglite://memory://",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      LEMONSQUEEZY_VARIANT_MONTHLY: "111",
      LEMONSQUEEZY_VARIANT_ANNUAL: "222",
    },
  },
});
