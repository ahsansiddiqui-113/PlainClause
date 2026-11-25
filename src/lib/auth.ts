import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { emailConfigured, emailLayout, escapeHtml, sendEmail } from "@/lib/email";
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
    // Only enforced when email can actually be delivered; otherwise nobody could ever sign in.
    requireEmailVerification: emailConfigured(),
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true, // re-sends the link when an unverified user tries to sign in
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Confirm your email for PlainClause",
        html: emailLayout(
          "Confirm your email",
          `<p>Hi ${escapeHtml(user.name || "there")}, confirm your email address to finish creating your PlainClause account.</p>` +
            `<p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#1e3a8a;color:#fff;border-radius:8px;text-decoration:none">Confirm email</a></p>` +
            `<p style="font-size:13px;color:#6b7280">If you didn’t sign up, you can ignore this email.</p>`,
        ),
        text: `Confirm your email for PlainClause: ${url}

If you did not sign up, ignore this email.`,
      });
    },
  },
  socialProviders:
    googleId && googleSecret ? { google: { clientId: googleId, clientSecret: googleSecret } } : {},
  plugins: [nextCookies()],
});
