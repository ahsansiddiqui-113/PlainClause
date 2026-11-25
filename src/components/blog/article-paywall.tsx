import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function ArticlePaywall({ hasPreview = true }: { hasPreview?: boolean }) {
  return (
    <div className="not-prose relative mt-2 rounded-lg border bg-muted/40 p-6 text-center">
      {hasPreview && (
        <div className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-background to-transparent" />
      )}
      <h2 className="text-xl font-semibold">The rest of this playbook is for Pro members</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Unlock full negotiation playbooks, word-for-word email scripts and unlimited document scans.
      </p>
      <Link href="/pricing" className={`${buttonVariants()} mt-4`}>
        Upgrade to Pro
      </Link>
    </div>
  );
}
