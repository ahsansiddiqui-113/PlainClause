import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteFooter, SiteHeader } from "@/components/site/header";
import { AdScriptLoader } from "@/components/ads/ad-script-loader";
import { Analytics } from "@/components/analytics/analytics";
import { ConsentBanner } from "@/components/ads/consent-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  title: { default: "PlainClause: Contract Fine Print in Plain English", template: "%s | PlainClause" },
  description:
    "Free tools that translate contracts, leases and fine print into plain English and flag the clauses that can cost you money.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        {/* Client-only ad gating reads the URL and session, so it streams in behind Suspense. */}
        <Suspense fallback={null}>
          <AdScriptLoader />
          <Analytics />
        </Suspense>
        <ConsentBanner />
      </body>
    </html>
  );
}
