import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DocumentUploader } from "@/components/tools/document-uploader";
import { FREE_FULL_DOC_SCANS } from "@/lib/plans";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Scan a document",
  robots: { index: false, follow: false },
};

async function UploadContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/upload");
  const freeScanUsed = user.plan === "free" && user.fullDocScansUsed >= FREE_FULL_DOC_SCANS;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Scan a full document</h1>
        <p className="text-muted-foreground">
          {user.plan === "pro"
            ? "Upload a lease, contract or policy (up to 25 pages). Results are saved to your vault."
            : freeScanUsed
              ? "You have used your free full-document scan."
              : "Try one free full-document scan (first 3 pages). Pro unlocks whole documents and the vault."}
        </p>
      </header>
      <DocumentUploader plan={user.plan} freeScanUsed={freeScanUsed} />
      <p className="text-xs text-muted-foreground">
        Your file is processed in memory and is not stored. Informational only, not legal advice.
      </p>
    </div>
  );
}

export default function UploadPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted/60" aria-hidden />}>
        <UploadContent />
      </Suspense>
    </main>
  );
}
