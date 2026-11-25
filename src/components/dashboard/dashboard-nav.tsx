"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, FileDown, LayoutDashboard, UploadCloud } from "lucide-react";
import { Wrap } from "@/components/site/wrap";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/upload", label: "Scan a document", icon: UploadCloud },
  { href: "/dashboard/exports", label: "Exports", icon: FileDown },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export function DashboardNav() {
  const path = usePathname();
  return (
    <div className="border-b bg-muted/40">
      <Wrap>
        <nav aria-label="Dashboard" className="-mb-px flex gap-1 overflow-x-auto">
          {items.map((i) => {
            const active = i.exact ? path === i.href : path.startsWith(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3.5 text-base font-medium transition-colors ${
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <i.icon className="size-4" aria-hidden />
                {i.label}
              </Link>
            );
          })}
        </nav>
      </Wrap>
    </div>
  );
}
