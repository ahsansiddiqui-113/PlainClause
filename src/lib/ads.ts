/** AdSense config (all public values). Ads are fully off when the publisher id is unset. */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
export const ADS_ENABLED = /^ca-pub-\d+$/.test(ADSENSE_CLIENT);

/** Ad unit ids from the AdSense dashboard. A slot with no id renders nothing. */
export const AD_SLOTS = {
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
  inline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE ?? "",
} as const;
export type AdSlotName = keyof typeof AD_SLOTS;

/**
 * Pages that may show ads: content pages only. Never the dashboard, auth, import, pricing or
 * legal pages (low-content / transactional pages are against AdSense policy and hurt conversion).
 */
export function isAdRoute(pathname: string | null) {
  if (!pathname) return false;
  return pathname === "/" || pathname.startsWith("/blog") || pathname.startsWith("/tools");
}
