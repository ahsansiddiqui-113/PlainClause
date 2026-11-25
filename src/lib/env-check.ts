/** Logged once at server start so a half-configured deploy is obvious in the Vercel logs. */
export function logEnvWarnings() {
  if (process.env.NODE_ENV !== "production") return;
  const v = process.env;
  const warn: string[] = [];
  const db = v.DATABASE_URL ?? "";
  if (!db || db.includes("@host/") || db.startsWith("pglite://")) warn.push("DATABASE_URL is missing or a placeholder: all data features will fail");
  if (!v.BETTER_AUTH_SECRET || v.BETTER_AUTH_SECRET.length < 32) warn.push("BETTER_AUTH_SECRET missing or shorter than 32 chars");
  if (!v.GOOGLE_GENERATIVE_AI_API_KEY) warn.push("GOOGLE_GENERATIVE_AI_API_KEY missing: scanning will fail");
  if (!v.NEXT_PUBLIC_SITE_URL || v.NEXT_PUBLIC_SITE_URL.includes("localhost")) warn.push("NEXT_PUBLIC_SITE_URL is unset/localhost: canonicals, sitemap and emails will be wrong");
  if (!v.BETTER_AUTH_URL || v.BETTER_AUTH_URL.includes("localhost")) warn.push("BETTER_AUTH_URL is unset/localhost: auth redirects and CSRF origin checks will fail");
  if (!v.LEMONSQUEEZY_API_KEY || !v.LEMONSQUEEZY_WEBHOOK_SECRET) warn.push("Lemon Squeezy not configured: checkout disabled");
  if (!v.RESEND_API_KEY || !v.EMAIL_FROM) warn.push("Resend not configured: no verification emails or deadline alerts");
  if (!v.CRON_SECRET) warn.push("CRON_SECRET missing: deadline-alert cron will return 503");
  for (const w of warn) console.warn(`[config] ${w}`);
  if (!warn.length) console.info("[config] all required environment variables are set");
}
