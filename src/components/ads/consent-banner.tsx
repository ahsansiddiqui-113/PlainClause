"use client";

import Link from "next/link";
import { ADS_ENABLED } from "@/lib/ads";
import { setConsent, useConsent } from "@/lib/consent";

const choiceBtn = "rounded-lg border border-input bg-background px-5 py-2.5 text-base font-semibold hover:bg-accent";

/** Equal-weight Accept / Reject, shown until a choice is made. Only exists when ads are configured. */
export function ConsentBanner() {
  const consent = useConsent();
  if (!ADS_ENABLED || consent !== "unknown") return null;
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-4 shadow-2xl sm:p-5"
    >
      <div className="mx-auto flex max-w-[96rem] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-base">
          We use cookies from Google to show ads that keep the free tools free. Ads load only if you accept. See our{" "}
          <Link href="/legal/privacy" className="font-medium underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={() => setConsent("denied")} className={choiceBtn}>
            Reject
          </button>
          <button type="button" onClick={() => setConsent("granted")} className={choiceBtn}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer link to change a previous choice. */
export function CookieSettingsButton() {
  if (!ADS_ENABLED) return null;
  return (
    <button type="button" onClick={() => setConsent("unknown")} className="text-muted-foreground hover:text-foreground">
      Cookie settings
    </button>
  );
}
