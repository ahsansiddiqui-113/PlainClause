"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Wrap } from "@/components/site/wrap";
import { buttonClass } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main>
      <Wrap className="py-24 text-center lg:py-32">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">Something went wrong</h1>
        <p className="mx-auto mt-5 max-w-xl text-xl text-muted-foreground">
          That&apos;s on us. Your documents are safe. Please try again, and if it keeps happening let us know
          {error.digest ? ` (reference ${error.digest})` : ""}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className={buttonClass({ size: "lg" })}>
            Try again
          </button>
          <Link href="/" className={buttonClass({ size: "lg", variant: "outline" })}>
            Home
          </Link>
        </div>
      </Wrap>
    </main>
  );
}
