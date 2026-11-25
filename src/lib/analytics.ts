"use client";

import posthog from "posthog-js";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const ANALYTICS_ENABLED = !!KEY;
let started = false;

/** Starts PostHog once. Cookieless and PII-free by design, so it needs no consent banner. */
export function startAnalytics() {
  if (!KEY || started || typeof window === "undefined") return;
  started = true;
  posthog.init(KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    persistence: "memory", // no cookies / localStorage: a visitor is only linked within one page load
    autocapture: false, // never scrape clicks or inputs (contract text lives in inputs)
    capture_pageview: false, // we send sanitised pageviews ourselves
    capture_pageleave: false,
    disable_session_recording: true,
    respect_dnt: true,
    person_profiles: "identified_only",
    ip: false,
  });
}

/** Opaque ids in URLs (document ids, article slugs stay) are replaced so no per-user path is sent. */
export function sanitizePath(path: string) {
  return path.replace(/\/dashboard\/documents\/[^/?#]+/, "/dashboard/documents/:id");
}

export function trackPageview(path: string) {
  if (!started) return;
  posthog.capture("$pageview", { $current_url: sanitizePath(path) });
}

/** Never pass contract text, emails or names in props: only counts, enums and booleans. */
export function track(event: string, props?: Record<string, string | number | boolean>) {
  if (!started) return;
  posthog.capture(event, props);
}
