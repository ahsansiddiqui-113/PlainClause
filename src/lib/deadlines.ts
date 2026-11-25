import { parseDate, startOfToday } from "@/lib/calculators";

export type DeadlineItem = {
  docId: string;
  title: string;
  kind: "notice" | "renewal";
  date: string; // YYYY-MM-DD
  daysLeft: number; // negative = already passed
};

type DocDates = {
  id: string;
  title: string;
  noticeDeadlineDate: string | null;
  renewalDate: string | null;
};

export const RISK_HIGH = 70;
export const RISK_MEDIUM = 40;

export function riskTier(score: number | null): "high" | "medium" | "low" | "none" {
  if (score === null) return "none";
  if (score >= RISK_HIGH) return "high";
  if (score >= RISK_MEDIUM) return "medium";
  return "low";
}

/**
 * Deadlines worth surfacing: everything upcoming plus anything that passed within
 * `graceDays` (so a missed notice date stays visible instead of silently vanishing).
 */
export function buildDeadlines(docs: DocDates[], today = startOfToday(), graceDays = 14): DeadlineItem[] {
  const out: DeadlineItem[] = [];
  for (const d of docs) {
    for (const [kind, value] of [
      ["notice", d.noticeDeadlineDate],
      ["renewal", d.renewalDate],
    ] as const) {
      const parsed = parseDate(value);
      if (!parsed) continue;
      const daysLeft = Math.round((parsed.getTime() - today.getTime()) / 86_400_000);
      if (daysLeft < -graceDays) continue;
      out.push({ docId: d.id, title: d.title, kind, date: value!, daysLeft });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function urgency(daysLeft: number): { label: string; cls: string } {
  if (daysLeft < 0) return { label: `${Math.abs(daysLeft)}d overdue`, cls: "bg-red-600 text-white" };
  if (daysLeft === 0) return { label: "Today", cls: "bg-red-600 text-white" };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, cls: "bg-red-100 text-red-800" };
  if (daysLeft <= 30) return { label: `${daysLeft}d left`, cls: "bg-amber-100 text-amber-900" };
  return { label: `${daysLeft}d left`, cls: "bg-muted text-muted-foreground" };
}
