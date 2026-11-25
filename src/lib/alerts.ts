import "server-only";
import { and, eq, gte, inArray, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { deadlineAlerts, scannedDocuments, users } from "@/db/schema";
import { emailLayout, escapeHtml, sendEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";

/** Days-before thresholds, tightest last. */
export const THRESHOLDS = [30, 14, 3] as const;

const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const utcDay = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));

/** Whole days from `today` (UTC) to a YYYY-MM-DD date. */
export function daysUntil(date: string, now: Date) {
  return Math.round((utcDay(date) - utcDay(iso(now))) / DAY);
}

/** Tightest threshold that has been reached (daysLeft <= t), or null if none / already passed. */
export function tightestThreshold(daysLeft: number): number | null {
  if (daysLeft < 0 || daysLeft > THRESHOLDS[0]) return null;
  return [...THRESHOLDS].reverse().find((t) => daysLeft <= t) ?? null;
}

type Alert = { docId: string; title: string; kind: "notice" | "renewal"; date: string; daysLeft: number };

export function buildAlertEmail(alerts: Alert[]) {
  const sorted = [...alerts].sort((a, b) => a.daysLeft - b.daysLeft);
  const label = (a: Alert) => (a.kind === "notice" ? "Notice deadline" : "Renewal date");
  const when = (n: number) => (n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`);
  const subject =
    sorted.length === 1
      ? `${label(sorted[0])} ${when(sorted[0].daysLeft)}: ${sorted[0].title.slice(0, 80)}`
      : `${sorted.length} contract deadlines coming up`;
  const rows = sorted
    .map(
      (a) =>
        `<li style="margin-bottom:12px"><strong>${escapeHtml(a.title)}</strong><br>${label(a)}: ${a.date} (${when(a.daysLeft)})<br>` +
        `<a href="${absoluteUrl(`/dashboard/documents/${a.docId}`)}">Open the summary</a></li>`,
    )
    .join("");
  const html = emailLayout(
    "Contract deadlines coming up",
    `<p>These dates from your saved contracts are close. Check the notice requirements so nothing renews or lapses by accident.</p><ul style="padding-left:18px">${rows}</ul>` +
      `<p style="font-size:13px;color:#6b7280">You get these reminders as a Pro member, at 30, 14 and 3 days before each date.</p>`,
  );
  const text =
    "Contract deadlines coming up:\n\n" +
    sorted.map((a) => `- ${a.title}\n  ${label(a)}: ${a.date} (${when(a.daysLeft)})\n  ${absoluteUrl(`/dashboard/documents/${a.docId}`)}`).join("\n") +
    "\n\nYou get these reminders as a Pro member, at 30, 14 and 3 days before each date.";
  return { subject, html, text };
}

export type AlertRun = { users: number; emails: number; alerts: number; failed: number };

/**
 * Finds Pro users' deadlines 0-30 days out and emails each user once per threshold.
 * Claims a row per (doc, kind, date, threshold) BEFORE sending (so concurrent/repeat runs never
 * double-send) and releases the claims if the email fails (so the next run retries).
 * If a document is first seen already inside a tighter window, the looser thresholds are
 * claimed silently so the user gets one email, not three.
 */
export async function runDeadlineAlerts(now = new Date()): Promise<AlertRun> {
  const today = iso(now);
  const horizon = iso(new Date(utcDay(today) + THRESHOLDS[0] * DAY));
  const rows = await db
    .select({
      docId: scannedDocuments.id,
      title: scannedDocuments.title,
      notice: scannedDocuments.noticeDeadlineDate,
      renewal: scannedDocuments.renewalDate,
      userId: users.id,
      email: users.email,
    })
    .from(scannedDocuments)
    .innerJoin(users, eq(users.id, scannedDocuments.userId))
    .where(
      and(
        eq(users.plan, "pro"),
        or(
          and(gte(scannedDocuments.noticeDeadlineDate, today), lte(scannedDocuments.noticeDeadlineDate, horizon)),
          and(gte(scannedDocuments.renewalDate, today), lte(scannedDocuments.renewalDate, horizon)),
        ),
      ),
    );

  const byUser = new Map<string, { email: string; alerts: Alert[]; claims: { docId: string; kind: string; date: string; t: number }[] }>();

  for (const r of rows) {
    for (const [kind, date] of [["notice", r.notice], ["renewal", r.renewal]] as const) {
      if (!date) continue;
      const daysLeft = daysUntil(date, now);
      const tight = tightestThreshold(daysLeft);
      if (tight === null) continue;
      const reached = THRESHOLDS.filter((t) => t >= daysLeft);
      const claimed: number[] = [];
      for (const t of reached) {
        const ins = await db
          .insert(deadlineAlerts)
          .values({ documentId: r.docId, kind, deadlineDate: date, threshold: t })
          .onConflictDoNothing()
          .returning({ t: deadlineAlerts.threshold });
        if (ins.length) claimed.push(t);
      }
      // Only email when the tightest reached threshold was newly claimed by us.
      if (!claimed.includes(tight)) continue;
      const u = byUser.get(r.userId) ?? { email: r.email, alerts: [], claims: [] };
      u.alerts.push({ docId: r.docId, title: r.title, kind, date, daysLeft });
      for (const t of claimed) u.claims.push({ docId: r.docId, kind, date, t });
      byUser.set(r.userId, u);
    }
  }

  const run: AlertRun = { users: byUser.size, emails: 0, alerts: 0, failed: 0 };
  for (const u of byUser.values()) {
    const sent = await sendEmail({ to: u.email, ...buildAlertEmail(u.alerts) });
    if (sent.ok) {
      run.emails++;
      run.alerts += u.alerts.length;
    } else {
      run.failed++;
      for (const c of u.claims) {
        await db
          .delete(deadlineAlerts)
          .where(
            and(
              eq(deadlineAlerts.documentId, c.docId),
              eq(deadlineAlerts.kind, c.kind),
              eq(deadlineAlerts.deadlineDate, c.date),
              inArray(deadlineAlerts.threshold, [c.t]),
            ),
          );
      }
    }
  }
  return run;
}
