import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { SITE_URL } from "@/lib/site";

const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    // Our tables are named in the plural; map them to Better Auth's model names.
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  user: {
    additionalFields: {
      // Set only by the billing webhook (Day 13); never by user input.
      plan: { type: "string", defaultValue: "free", input: false },
      // Free full-document scans used (server-managed).
      fullDocScansUsed: { type: "number", defaultValue: 0, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Email verification is switched on once Resend is wired up (Day 14).
    requireEmailVerification: false,
  },
  socialProviders:
    googleId && googleSecret ? { google: { clientId: googleId, clientSecret: googleSecret } } : {},
  plugins: [nextCookies()],
});
