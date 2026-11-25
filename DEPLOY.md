# Deploying PlainClause (Vercel + Neon)

Do these in order. Every variable is documented in `.env.example`.

## 1. Accounts
- **Neon**: create a project, copy the pooled connection string into `DATABASE_URL`, then run `npm run db:push` once against it.
- **Google AI Studio**: paid-tier key in `GOOGLE_GENERATIVE_AI_API_KEY` (the free tier may train on inputs, which contradicts the privacy page).
- **Polar** (merchant of record; Pakistani bank payouts go through Stripe Connect, so connect a PKR bank account in Polar > Finance > Account): start in the sandbox (sandbox.polar.sh), create two recurring products ($8/mo, $59/yr), an Organization Access Token, and a webhook to `https://YOURDOMAIN/api/webhooks/billing` with all `subscription.*` events. Put the values in the `POLAR_*` variables.
- **Resend**: verify your sending domain, then set `RESEND_API_KEY` and `EMAIL_FROM`.
- Optional: **Sentry** (`SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`), **PostHog** (`NEXT_PUBLIC_POSTHOG_KEY`), **Google OAuth** (redirect URI `https://YOURDOMAIN/api/auth/callback/google`).

## 2. Vercel project
1. Import the repo. Framework: Next.js (auto).
2. Add all environment variables for **Production** (and Preview if you want previews to work).
   - `NEXT_PUBLIC_*` values are baked in at build time: set them before the first build, and redeploy after changing them.
   - Must be real, non-localhost: `NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL`. `BETTER_AUTH_SECRET` must be 32+ random characters.
   - Add `CRON_SECRET` (any long random string). Vercel then calls `/api/cron/deadline-alerts` daily (see `vercel.json`).
3. Attach your domain.
4. Deploy, then open the function logs: a `[config]` line lists anything still missing.

## 3. Smoke test (production)
- `GET /api/health` returns `{"ok":true}`.
- Sign up (verification email arrives), scan a clause, upload a PDF, save to vault.
- Sandbox purchase on `/pricing` (card 4242 4242 4242 4242): the account flips to Pro and exports unlock; cancel from the billing page.
- `/robots.txt`, `/sitemap.xml` and `/ads.txt` use your real domain.
- Trigger the cron manually: `curl -H "Authorization: Bearer $CRON_SECRET" https://YOURDOMAIN/api/cron/deadline-alerts`.

## 4. Launch
- Switch Polar to production: new organization and token at polar.sh, new product ids and webhook secret, and set `POLAR_SERVER=production`.
- Search Console: add the property, submit `/sitemap.xml`, request indexing for the home page and the top tools.
- Set up an uptime monitor on `/api/health`.
- AdSense (after you have traffic and content): apply, then set `NEXT_PUBLIC_ADSENSE_CLIENT` and slot ids and redeploy.
- Have a lawyer review `/legal/*`, and a human fact-check each article before applying for AdSense.
