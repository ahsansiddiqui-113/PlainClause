"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Analysis } from "@/lib/ai/schema";
import { track } from "@/lib/analytics";

const MAX = 600;
const EXAMPLE =
  "Landlord may retain the entire security deposit as liquidated damages upon termination for any reason. Tenant waives any claim to an itemized statement of deductions.";
type Level = "LOW" | "MEDIUM" | "HIGH";
type Result = Omit<Analysis, "negotiationCounterScript"> & {
  negotiationTeaser: string;
  remaining: number;
};

const levelClass: Record<Level, string> = {
  LOW: "bg-green-600 text-white hover:bg-green-600",
  MEDIUM: "bg-amber-500 text-black hover:bg-amber-500",
  HIGH: "bg-red-600 text-white hover:bg-red-600",
};

function RiskBadge({ level }: { level: Level }) {
  return <Badge className={levelClass[level]}>{level} RISK</Badge>;
}

export function ClauseScanner({ presetText = "" }: { presetText?: string }) {
  const [text, setText] = useState(presetText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // The scan is already in sessionStorage; /import moves it into the vault after login.
  function saveToVault() {
    track("save_to_vault_clicked", { signedIn: !!session?.user });
    router.push(session?.user ? "/import" : "/login?mode=signup&next=/import");
  }

  async function scan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data);
      track("scan_completed", { mode: "snippet", risk: String(data.riskLevel ?? "") });
      try {
        sessionStorage.setItem("pc:lastScan", JSON.stringify({ text, result: data }));
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const tooShort = text.trim().length < 20;

  const notContract = result?.isContractText === false;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder="Paste one or two contract paragraphs here…"
          rows={7}
          className="text-base"
          aria-label="Contract text"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {text.length}/{MAX} characters
          </span>
          <div className="flex gap-2">
            {!text && (
              <Button variant="outline" onClick={() => setText(EXAMPLE)}>
                Try an example
              </Button>
            )}
            <Button onClick={scan} disabled={loading || tooShort}>
              {loading ? "Scanning…" : "Scan for red flags"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Plain-English translation</CardTitle>
              {notContract ? <Badge variant="secondary">NOT A CONTRACT</Badge> : <RiskBadge level={result.riskLevel} />}
            </CardHeader>
            <CardContent className="space-y-2">
              <p>{result.plainEnglishSummary}</p>
              {notContract && (
                <p className="text-sm text-muted-foreground">
                  This doesn&apos;t look like contract or fine-print text, so there is no risk rating. Paste the actual clause you
                  were asked to sign (up to 600 characters) to scan it.
                </p>
              )}
            </CardContent>
          </Card>

          {result.redFlags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Red flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.redFlags.map((f, i) => (
                  <div key={i} className="space-y-1 border-l-2 pl-3">
                    <RiskBadge level={f.severity} />
                    <blockquote className="text-sm italic">“{f.clauseQuote}”</blockquote>
                    <p className="text-sm">{f.whyItMatters}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {!notContract && (
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Negotiation email draft</CardTitle>
            </CardHeader>
            <CardContent>
              <p aria-hidden className="select-none blur-sm">
                {result.negotiationTeaser}… Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60">
                <p className="text-sm font-medium">Unlock the full email draft with Pro</p>
                <Link href="/pricing" className={buttonClass({ size: "sm" })}>
                  Upgrade to Pro
                </Link>
              </div>
            </CardContent>
          </Card>
          )}

          {!notContract && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-accent/50 p-4">
            <div>
              <p className="font-medium">Keep this scan</p>
              <p className="text-sm text-muted-foreground">
                {session?.user ? "Save it to your vault." : "Create a free account to save it and get deadline reminders."}
              </p>
            </div>
            <Button onClick={saveToVault}>{session?.user ? "Save to Vault" : "Save to Vault (free)"}</Button>
          </div>
          )}

          <p className="text-xs text-muted-foreground">
            {result.remaining} free scan{result.remaining === 1 ? "" : "s"} left today.
            Informational only, not legal advice.
          </p>
        </div>
      )}
    </div>
  );
}
