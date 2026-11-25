export const SITE_NAME = "PlainClause";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Public, indexable static routes. Add new tool/landing pages here so the sitemap stays in sync. */
export const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/tools/clause-scanner", priority: 0.9 },
  { path: "/tools/notice-period-calculator", priority: 0.8 },
  { path: "/tools/deposit-deduction-checker", priority: 0.8 },
  { path: "/tools/rental-lease-scanner", priority: 0.9 },
  { path: "/tools/freelance-contract-checker", priority: 0.9 },
  { path: "/tools/job-offer-red-flags", priority: 0.9 },
  { path: "/blog", priority: 0.7 },
];

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@plainclause.example";
export const LEGAL_UPDATED = "November 25, 2026";

export const LEGAL_ROUTES: { path: string; priority: number }[] = [
  { path: "/about", priority: 0.5 },
  { path: "/legal/disclaimer", priority: 0.4 },
  { path: "/legal/privacy", priority: 0.4 },
  { path: "/legal/terms", priority: 0.4 },
];
