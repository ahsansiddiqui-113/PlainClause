import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    const { logEnvWarnings } = await import("./lib/env-check");
    logEnvWarnings();
  }
}

// Reports unhandled server errors (route handlers, server components) to Sentry when it is configured.
export const onRequestError = Sentry.captureRequestError;
