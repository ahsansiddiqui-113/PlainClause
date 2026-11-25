"use client";

import { Suspense, useEffect, useRef } from "react";
import { ADSENSE_CLIENT, AD_SLOTS, type AdSlotName } from "@/lib/ads";
import { useAdsAllowed } from "./use-ads-allowed";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function Inner({ name, className }: { name: AdSlotName; className?: string }) {
  const allowed = useAdsAllowed();
  const slot = AD_SLOTS[name];
  const pushed = useRef(false);

  useEffect(() => {
    if (!allowed || !slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blockers / script not ready: slot just stays empty */
    }
  }, [allowed, slot]);

  if (!allowed || !slot) return null;
  return (
    <aside aria-label="Advertisement" className={className}>
      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Advertisement</p>
      <ins
        className="adsbygoogle block min-h-[250px] w-full"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

/** Renders nothing unless ads are configured, consented to, on a content page and the viewer isn't Pro. */
export function AdSlot(props: { name: AdSlotName; className?: string }) {
  return (
    <Suspense fallback={null}>
      <Inner {...props} />
    </Suspense>
  );
}
