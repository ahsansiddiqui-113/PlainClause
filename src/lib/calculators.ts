// Pure, zero-AI calculators. Dates are handled as local calendar dates (YYYY-MM-DD)
// to avoid timezone off-by-one errors.

const DAY_MS = 86_400_000;

export function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  // Reject overflow like 2025-02-31
  if (d.getFullYear() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[3])) {
    return null;
  }
  return d;
}

export function formatISO(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function daysBetween(a: Date, b: Date): number {
  // Round to absorb DST shifts.
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export type NoticeResult = {
  deadline: Date;
  daysUntilDeadline: number;
  status: "upcoming" | "today" | "passed";
};

/** Last day to deliver notice so that `noticeDays` full days remain before the end date. */
export function noticeDeadline(endDate: Date, noticeDays: number, today = startOfToday()): NoticeResult {
  const deadline = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - noticeDays);
  const daysUntilDeadline = daysBetween(today, deadline);
  return {
    deadline,
    daysUntilDeadline,
    status: daysUntilDeadline > 0 ? "upcoming" : daysUntilDeadline === 0 ? "today" : "passed",
  };
}

export type ProrateResult = {
  daysInMonth: number;
  daysCharged: number;
  dailyRate: number;
  amount: number;
};

/** Rent for a partial first month, counting the move-in day as a charged day. */
export function proratedRent(monthlyRent: number, moveIn: Date): ProrateResult {
  const daysInMonth = new Date(moveIn.getFullYear(), moveIn.getMonth() + 1, 0).getDate();
  const daysCharged = daysInMonth - moveIn.getDate() + 1;
  const dailyRate = monthlyRent / daysInMonth;
  return { daysInMonth, daysCharged, dailyRate, amount: round2(dailyRate * daysCharged) };
}

export type DeductionItem = { label: string; amount: number };

export function depositSummary(deposit: number, items: DeductionItem[]) {
  const totalDeductions = round2(items.reduce((s, i) => s + i.amount, 0));
  const refund = round2(Math.max(0, deposit - totalDeductions));
  const owedByTenant = round2(Math.max(0, totalDeductions - deposit));
  return { totalDeductions, refund, owedByTenant };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Items are stored in the URL as "label:amount" pairs separated by "~". */
export function encodeItems(items: DeductionItem[]): string {
  return items
    .filter((i) => i.label.trim() || i.amount)
    .map((i) => `${i.label.replace(/[~:]/g, " ")}:${i.amount}`)
    .join("~");
}

export function decodeItems(s: string | null | undefined): DeductionItem[] {
  if (!s) return [];
  return s
    .split("~")
    .map((part) => {
      const idx = part.lastIndexOf(":");
      if (idx < 0) return null;
      const amount = Number(part.slice(idx + 1));
      if (!Number.isFinite(amount) || amount < 0) return null;
      return { label: part.slice(0, idx), amount };
    })
    .filter((x): x is DeductionItem => x !== null)
    .slice(0, 30);
}

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
