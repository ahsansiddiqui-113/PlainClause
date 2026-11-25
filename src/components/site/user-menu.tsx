"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

/** Client-side so the header never makes pages dynamic. */
export function UserMenu() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  if (isPending) return <span className="h-9 w-16" aria-hidden />;

  if (!data?.user) {
    return (
      <Link
        href="/login"
        className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:block"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-1 sm:flex">
      <Link
        href="/dashboard"
        className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        Dashboard
      </Link>
      <button
        type="button"
        onClick={async () => {
          await authClient.signOut();
          router.replace("/");
          router.refresh();
        }}
        className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        Sign out
      </button>
    </div>
  );
}
