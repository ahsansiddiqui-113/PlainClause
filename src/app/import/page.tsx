"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonClass } from "@/components/ui/button";

type State = { kind: "working" } | { kind: "empty" } | { kind: "error"; message: string };

/**
 * Landing page after login/signup: moves the scan saved in sessionStorage into the vault.
 * Safe to reload: the API de-duplicates identical text per user.
 */
export default function ImportPage() {
  const router = useRouter();
  const started = useRef(false);
  const [state, setState] = useState<State>({ kind: "working" });

  async function run() {
    setState({ kind: "working" });
    let text = "";
    try {
      const raw = sessionStorage.getItem("pc:lastScan");
      text = raw ? (JSON.parse(raw).text ?? "") : "";
    } catch {}
    if (!text) {
      setState({ kind: "empty" });
      return;
    }
    try {
      const res = await fetch("/api/vault/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.status === 401) {
        router.replace("/login?next=/import");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ kind: "error", message: data.error ?? "Could not save your scan." });
        return;
      }
      try {
        sessionStorage.removeItem("pc:lastScan");
      } catch {}
      router.replace(`/dashboard?saved=${encodeURIComponent(data.id)}`);
    } catch {
      setState({ kind: "error", message: "Could not reach the server. Please try again." });
    }
  }

  useEffect(() => {
    if (started.current) return; // StrictMode runs effects twice in development
    started.current = true;
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      {state.kind === "working" && (
        <div role="status" className="space-y-3">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <h1 className="text-xl font-semibold">Saving your scan to your vault…</h1>
          <p className="text-sm text-muted-foreground">This takes a few seconds.</p>
        </div>
      )}
      {state.kind === "empty" && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">Nothing to save yet</h1>
          <p className="text-sm text-muted-foreground">Scan a clause first, then choose Save to Vault.</p>
          <div className="flex justify-center gap-3">
            <Link href="/tools/clause-scanner" className={buttonClass()}>
              Scan a clause
            </Link>
            <Link href="/dashboard" className={buttonClass({ variant: "outline" })}>
              Go to dashboard
            </Link>
          </div>
        </div>
      )}
      {state.kind === "error" && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">We couldn&apos;t save your scan</h1>
          <p className="text-sm text-muted-foreground">{state.message}</p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => void run()}>Try again</Button>
            <Link href="/dashboard" className={buttonClass({ variant: "outline" })}>
              Go to dashboard
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
