"use client";

import { usePathname } from "next/navigation";
import { ADS_ENABLED, isAdRoute } from "@/lib/ads";
import { authClient } from "@/lib/auth-client";
import { useConsent } from "@/lib/consent";

/**
 * Single gate for everything ad-related: configured, content page, consent granted, and the
 * viewer is not Pro. Waits for the session to resolve so Pro members never see a flash of ads.
 */
export function useAdsAllowed() {
  const pathname = usePathname();
  const consent = useConsent();
  const { data, isPending } = authClient.useSession();
  if (!ADS_ENABLED || !isAdRoute(pathname) || consent !== "granted" || isPending) return false;
  const plan = (data?.user as { plan?: string } | undefined)?.plan;
  return plan !== "pro";
}
