import "server-only";
import { createHash } from "node:crypto";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { scannedDocuments, users } from "@/db/schema";
import { FREE_FULL_DOC_SCANS } from "@/lib/plans";
import { analysisSchema, type Analysis } from "@/lib/ai/schema";
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

/** Saves a full-document (PDF/DOCX) analysis. The file itself is never stored. */
export async function saveFullDocument(
  userId: string,
  meta: { title: string; fileName: string; pagesRead: number | null; totalPages: number | null },
  analysis: Analysis,
) {
  const dates = keyDates(analysis);
  const [row] = await db
    .insert(scannedDocuments)
    .values({
      userId,
      title: meta.title,
      docType: "document",
      riskScore: riskScoreFor(analysis),
      summaryJson: { analysis, fileName: meta.fileName, pagesRead: meta.pagesRead, totalPages: meta.totalPages },
      renewalDate: dates.renewalDate,
      noticeDeadlineDate: dates.noticeDeadlineDate,
    })
    .returning({ id: scannedDocuments.id });
  return row.id;
}

/**
 * Atomically claims one free full-document scan. A single conditional UPDATE means two
 * parallel uploads cannot both succeed. Returns false when the allowance is used up.
 */
export async function reserveFreeDocScan(userId: string): Promise<boolean> {
  const rows = await db
    .update(users)
    .set({ fullDocScansUsed: sql`${users.fullDocScansUsed} + 1` })
    .where(and(eq(users.id, userId), lt(users.fullDocScansUsed, FREE_FULL_DOC_SCANS)))
    .returning({ used: users.fullDocScansUsed });
  return rows.length > 0;
}

/** Gives the scan back when the analysis itself failed (not the user's fault). */
export async function refundFreeDocScan(userId: string) {
  await db
    .update(users)
    .set({ fullDocScansUsed: sql`greatest(${users.fullDocScansUsed} - 1, 0)` })
    .where(eq(users.id, userId));
}

export type StoredDocument = {
  id: string;
  title: string;
  docType: string;
  riskScore: number | null;
  renewalDate: string | null;
  noticeDeadlineDate: string | null;
  createdAt: Date;
  analysis: Analysis | null;
  sourceText: string | null;
  fileName: string | null;
  pagesRead: number | null;
  totalPages: number | null;
};

function hydrate(row: typeof scannedDocuments.$inferSelect): StoredDocument {
  const json = (row.summaryJson ?? {}) as Record<string, unknown>;
  const parsed = analysisSchema.safeParse(json.analysis);
  return {
    id: row.id,
    title: row.title,
    docType: row.docType,
    riskScore: row.riskScore,
    renewalDate: row.renewalDate,
    noticeDeadlineDate: row.noticeDeadlineDate,
    createdAt: row.createdAt,
    analysis: parsed.success ? parsed.data : null,
    sourceText: typeof json.sourceText === "string" ? json.sourceText : null,
    fileName: typeof json.fileName === "string" ? json.fileName : null,
    pagesRead: typeof json.pagesRead === "number" ? json.pagesRead : null,
    totalPages: typeof json.totalPages === "number" ? json.totalPages : null,
  };
}

/** Always scoped to the owner: a document id alone never grants access. */
export async function getDocument(userId: string, id: string): Promise<StoredDocument | null> {
  const [row] = await db
    .select()
    .from(scannedDocuments)
    .where(and(eq(scannedDocuments.id, id), eq(scannedDocuments.userId, userId)))
    .limit(1);
  return row ? hydrate(row) : null;
}

export async function deleteDocument(userId: string, id: string): Promise<boolean> {
  const rows = await db
    .delete(scannedDocuments)
    .where(and(eq(scannedDocuments.id, id), eq(scannedDocuments.userId, userId)))
    .returning({ id: scannedDocuments.id });
  return rows.length > 0;
}

export async function listDocumentsFull(userId: string): Promise<StoredDocument[]> {
  const rows = await db
    .select()
    .from(scannedDocuments)
    .where(eq(scannedDocuments.userId, userId))
    .orderBy(desc(scannedDocuments.createdAt));
  return rows.map(hydrate);
}
