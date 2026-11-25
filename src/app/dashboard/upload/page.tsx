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
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Scan a full document</h1>
        <p className="text-lg text-muted-foreground">
          {user.plan === "pro"
            ? "Upload a lease, contract or policy (up to 25 pages). Results are saved to your vault."
            : freeScanUsed
              ? "You have used your free full-document scan."
              : "Try one free full-document scan (first 3 pages). Pro unlocks whole documents and the vault."}
        </p>
      </header>
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <DocumentUploader plan={user.plan} freeScanUsed={freeScanUsed} />
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-3xl border bg-accent/50 p-6 text-base text-muted-foreground">
            <h2 className="text-lg font-semibold text-foreground">What to expect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>PDF or Word (.docx), up to 4 MB.</li>
              <li>{user.plan === "pro" ? "Up to 25 pages per document." : "Free: one full scan covering the first 3 pages."}</li>
              <li>Scanned images without selectable text can&apos;t be read. Paste the text instead.</li>
              <li>Your file is processed in memory and is not stored.</li>
            </ul>
          </div>
          <p className="px-1 text-sm text-muted-foreground">Informational only, not legal advice.</p>
        </aside>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <main className="mx-auto w-full max-w-[96rem] px-5 py-12 sm:px-8 lg:px-14 lg:py-16">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted/60" aria-hidden />}>
        <UploadContent />
      </Suspense>
    </main>
  );
}
