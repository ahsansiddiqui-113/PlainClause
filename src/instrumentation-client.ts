import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "./sentry-scrub";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  // Errors only. Performance spans record full URLs including query strings.
  tracesSampleRate: 0,
  // Sentry 11 collects bodies, cookies, headers and query strings by default: turn all of it off.
  // Contracts are private, so only the error, stack and route reach Sentry.
  dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
  // No session replay: it would record contract text on screen.
  beforeSend: scrubEvent,
  // Console breadcrumbs repeat error text verbatim.
  beforeBreadcrumb: (b) => (b.category === "console" ? null : b),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
