import "server-only";
import { createHash } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { scannedDocuments } from "@/db/schema";
import type { Analysis } from "@/lib/ai/schema";
import { formatISO, parseDate } from "@/lib/calculators";

export function hashSource(text: string): string {
  return createHash("sha256").update(text.replace(/\s+/g, " ").trim().toLowerCase()).digest("hex").slice(0, 32);
}

export function riskScoreFor(a: Analysis): number {
  const base = { LOW: 15, MEDIUM: 50, HIGH: 80 }[a.riskLevel];
  return Math.min(100, base + Math.min(15, a.redFlags.length * 5));
}

export function titleFor(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > 70 ? `${t.slice(0, 67)}…` : t;
}

/** Pulls usable ISO dates out of the model's extractedDates for the reminder cron (Day 14). */
export function keyDates(a: Analysis): { renewalDate: string | null; noticeDeadlineDate: string | null } {
  let renewal: string | null = null;
  let notice: string | null = null;
  for (const d of a.extractedDates) {
    const parsed = parseDate(d.date);
    if (!parsed) continue;
    const iso = formatISO(parsed);
    const label = d.label.toLowerCase();
    if (label.includes("notice") || label.includes("deadline")) {
      if (!notice || iso < notice) notice = iso;
    } else if (label.includes("renew") || label.includes("expir") || label.includes("end")) {
      if (!renewal || iso < renewal) renewal = iso;
    }
  }
  return { renewalDate: renewal, noticeDeadlineDate: notice };
}

export async function findDuplicate(userId: string, sourceHash: string) {
  const [row] = await db
    .select({ id: scannedDocuments.id })
    .from(scannedDocuments)
    .where(
      and(
        eq(scannedDocuments.userId, userId),
        sql`${scannedDocuments.summaryJson}->>'sourceHash' = ${sourceHash}`,
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function saveSnippetDocument(userId: string, sourceText: string, analysis: Analysis) {
  const dates = keyDates(analysis);
  const [row] = await db
    .insert(scannedDocuments)
    .values({
      userId,
      title: titleFor(sourceText),
      docType: "clause",
      riskScore: riskScoreFor(analysis),
      summaryJson: { analysis, sourceText, sourceHash: hashSource(sourceText) },
      renewalDate: dates.renewalDate,
      noticeDeadlineDate: dates.noticeDeadlineDate,
    })
    .returning({ id: scannedDocuments.id });
  return row.id;
}

export async function listDocuments(userId: string) {
  return db
    .select({
      id: scannedDocuments.id,
      title: scannedDocuments.title,
      docType: scannedDocuments.docType,
      riskScore: scannedDocuments.riskScore,
      noticeDeadlineDate: scannedDocuments.noticeDeadlineDate,
      renewalDate: scannedDocuments.renewalDate,
      createdAt: scannedDocuments.createdAt,
    })
    .from(scannedDocuments)
    .where(eq(scannedDocuments.userId, userId))
    .orderBy(desc(scannedDocuments.createdAt));
}
