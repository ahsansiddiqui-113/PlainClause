import { Suspense } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* usePathname() is URL data on dynamic routes, so the nav streams in behind a fallback. */}
      <Suspense fallback={<div className="h-[3.4rem] border-b bg-muted/40" aria-hidden />}>
        <DashboardNav />
      </Suspense>
      {children}
    </>
  );
}
