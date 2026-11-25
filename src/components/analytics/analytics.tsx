"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { startAnalytics, trackPageview } from "@/lib/analytics";

/** Mount once in the root layout (inside Suspense). Renders nothing; no-op without a PostHog key. */
export function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    startAnalytics();
  }, []);
  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);
  return null;
}
