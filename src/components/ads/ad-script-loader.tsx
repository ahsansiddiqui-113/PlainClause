"use client";

import Script from "next/script";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { useAdsAllowed } from "./use-ads-allowed";

/** Loads the AdSense script only when ads are allowed for this viewer on this page. */
export function AdScriptLoader() {
  const allowed = useAdsAllowed();
  if (!allowed) return null;
  return (
    <Script
      id="adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
