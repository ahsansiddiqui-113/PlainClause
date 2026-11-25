"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Last-resort boundary when the root layout itself fails. Must render its own <html>.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "6rem 1.5rem" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Something went wrong</h1>
        <p style={{ fontSize: "1.2rem", color: "#555" }}>Please reload the page. Your documents are safe.</p>
        {/* Plain anchor on purpose: the root layout failed, so force a full reload. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" style={{ fontSize: "1.1rem" }}>Go home</a>
      </body>
    </html>
  );
}
