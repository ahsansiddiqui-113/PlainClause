"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Analysis } from "@/lib/ai/schema";

const MAX = 600;
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder="Paste one or two contract paragraphs here…"
          rows={7}
          aria-label="Contract text"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {text.length}/{MAX} characters
          </span>
          <Button onClick={scan} disabled={loading || tooShort}>
            {loading ? "Scanning…" : "Scan for red flags"}
          </Button>
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
              <RiskBadge level={result.riskLevel} />
            </CardHeader>
            <CardContent>
              <p>{result.plainEnglishSummary}</p>
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
                <Button size="sm" disabled>
                  Upgrade to Pro (coming soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            {result.remaining} free scan{result.remaining === 1 ? "" : "s"} left today.
            Informational only, not legal advice.
          </p>
        </div>
      )}
    </div>
  );
}
