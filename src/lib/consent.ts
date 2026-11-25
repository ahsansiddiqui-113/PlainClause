"use client";

import { useSyncExternalStore } from "react";

export type Consent = "granted" | "denied" | "unknown";
const KEY = "pc:consent";
const EVENT = "pc:consent-change";

export function readConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unknown";
  } catch {
    return "unknown";
  }
}

/** Store a choice. Revoking after ads loaded reloads the page so the ad script is dropped. */
export function setConsent(value: Consent) {
  const prev = readConsent();
  try {
    if (value === "unknown") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  } catch {
    /* storage blocked: choice only lasts for this page view */
  }
  window.dispatchEvent(new Event(EVENT));
  if (prev === "granted" && value !== "granted") window.location.reload();
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** "unknown" on the server and during hydration, so nothing ad-related renders before consent is read. */
export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, readConsent, () => "unknown");
}
