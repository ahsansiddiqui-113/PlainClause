import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Contracts are private. Never let request bodies, cookies or auth headers reach Sentry, and
 * drop user identity beyond an opaque id.
 */
const MAX = 160;
const clip = (v?: string) => (v && v.length > MAX ? `${v.slice(0, MAX)}…` : v);

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    delete event.request.query_string;
    if (event.request.headers) {
      for (const h of Object.keys(event.request.headers)) {
        if (/^(cookie|authorization|x-signature|x-forwarded-for)$/i.test(h)) delete event.request.headers[h];
      }
    }
  }
  // An error message could echo user text; keep enough to debug, not enough to leak a document.
  event.message = clip(event.message);
  for (const e of event.exception?.values ?? []) e.value = clip(e.value);
  if (event.user) event.user = { id: event.user.id };
  return event;
}
