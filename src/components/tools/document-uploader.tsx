"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MAX_UPLOAD_BYTES } from "@/lib/plans";
import type { Analysis } from "@/lib/ai/schema";
import { track } from "@/lib/analytics";

type Level = "LOW" | "MEDIUM" | "HIGH";
type Result = {
  fileName: string;
  pagesAnalyzed: number | null;
  totalPages: number | null;
  truncated: boolean;
  plan: "free" | "pro";
  saved: boolean;
  id?: string;
  analysis: Omit<Analysis, "negotiationCounterScript"> & {
    negotiationCounterScript?: string;
    negotiationTeaser?: string;
  };
};
type Failure = { message: string; code?: string };

const levelClass: Record<Level, string> = {
  LOW: "bg-green-600 text-white hover:bg-green-600",
  MEDIUM: "bg-amber-500 text-black hover:bg-amber-500",
  HIGH: "bg-red-600 text-white hover:bg-red-600",
};
const Risk = ({ level }: { level: Level }) => <Badge className={levelClass[level]}>{level} RISK</Badge>;

export function DocumentUploader({ plan, freeScanUsed }: { plan: "free" | "pro"; freeScanUsed: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function upload(file: File) {
    setFailure(null);
    setResult(null);
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
      setFailure({ message: "Upload a PDF or a Word (.docx) file." });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setFailure({ message: `File is too large. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.` });
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/documents/analyze", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFailure({ message: data.error ?? "Something went wrong.", code: data.code });
        return;
      }
      setResult(data);
      track("document_scanned", { pro: !!data.saved });
    } catch {
      setFailure({ message: "Could not reach the server. Please try again." });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const blockedFree = plan === "free" && freeScanUsed && !result;

  return (
    <div className="space-y-6">
      {blockedFree ? (
        <UpgradeCard />
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void upload(f);
          }}
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
            drag ? "border-primary bg-accent" : "hover:border-primary/50 hover:bg-accent/40"
          } ${busy ? "pointer-events-none opacity-60" : ""}`}
        >
          <FileUp className="size-8 text-primary" aria-hidden />
          <span className="font-medium">{busy ? "Analyzing your document…" : "Drop a PDF or Word file here, or click to choose"}</span>
          <span className="text-sm text-muted-foreground">
            PDF or .docx, up to {MAX_UPLOAD_BYTES / 1024 / 1024} MB.{" "}
            {plan === "pro" ? "Up to 25 pages." : "Free scan covers the first 3 pages."}
          </span>
          <input
            ref={input}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
        </label>
      )}

      {busy && (
        <div role="status" className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Reading and analyzing. Longer documents can take up to a minute.
        </div>
      )}

      {failure &&
        (failure.code === "upgrade_required" ? (
          <UpgradeCard message={failure.message} />
        ) : (
          <Alert variant="destructive">
            <AlertDescription>{failure.message}</AlertDescription>
          </Alert>
        ))}

      {result && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{result.fileName}</span>
            {result.pagesAnalyzed !== null && (
              <span>
                · analyzed {result.pagesAnalyzed} of {result.totalPages} page{result.totalPages === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {result.truncated && (
            <Alert>
              <AlertDescription>
                Your free scan covered the first {result.pagesAnalyzed} pages of {result.totalPages}. Pro scans the
                whole document.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Plain-English summary</CardTitle>
              <Risk level={result.analysis.riskLevel} />
            </CardHeader>
            <CardContent>
              <p>{result.analysis.plainEnglishSummary}</p>
            </CardContent>
          </Card>

          {result.analysis.redFlags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Red flags ({result.analysis.redFlags.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.analysis.redFlags.map((f, i) => (
                  <div key={i} className="space-y-1 border-l-2 pl-3">
                    <Risk level={f.severity} />
                    <blockquote className="text-sm italic">“{f.clauseQuote}”</blockquote>
                    <p className="text-sm">{f.whyItMatters}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.analysis.extractedDates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key dates</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.analysis.extractedDates.map((d, i) => (
                    <li key={i}>
                      <span className="font-medium">{d.label}:</span> {d.date}
                      {d.actionRequired && d.actionRequired !== "None" && (
                        <span className="text-muted-foreground"> · {d.actionRequired}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.plan === "pro" && result.analysis.negotiationCounterScript ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Negotiation email draft</CardTitle>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(result.analysis.negotiationCounterScript ?? "");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-sans text-sm">{result.analysis.negotiationCounterScript}</pre>
              </CardContent>
            </Card>
          ) : (
            <UpgradeCard message="Unlock the full negotiation email, whole-document scans and your Contract Vault with Pro." />
          )}

          {result.saved && (
            <p className="text-sm text-muted-foreground">
              Saved to your vault.{" "}
              <Link href="/dashboard" className="font-medium text-primary hover:underline">
                View dashboard
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function UpgradeCard({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border bg-accent/50 p-6 text-center">
      <h2 className="text-lg font-semibold">You have used your free full-document scan</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {message ?? "Upgrade to Pro for unlimited multi-page scans, full negotiation emails and your Contract Vault."}
      </p>
      <Link href="/pricing" className={`${buttonClass()} mt-4`}>
        Upgrade to Pro
      </Link>
    </div>
  );
}
