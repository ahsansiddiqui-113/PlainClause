"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

type Props = {
  plan: "monthly" | "annual";
  signedIn: boolean;
  alreadyPro: boolean;
  featured?: boolean;
  label: string;
};

export function CheckoutButton({ plan, signedIn, alreadyPro, featured, label }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cls = `${buttonClass({ size: "lg", variant: featured ? "default" : "outline" })} w-full`;

  if (alreadyPro) {
    return (
      <Link href="/dashboard/billing" className={cls}>
        You&apos;re on Pro, manage plan
      </Link>
    );
  }
  if (!signedIn) {
    return (
      <Link href="/login?mode=signup&next=/pricing" className={cls}>
        {label}
      </Link>
    );
  }

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div>
      <button type="button" onClick={go} disabled={busy} className={cls}>
        {busy && <Loader2 className="size-5 animate-spin" aria-hidden />}
        {label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
