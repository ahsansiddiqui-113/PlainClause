import { and, eq, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "@/db";
import { deadlineAlerts, scannedDocuments, users } from "@/db/schema";

// Exercises the lazy PGlite driver (pglite://memory:// from vitest.config.ts): migrations on first
// query, and the value types the app relies on (raw date strings, Date timestamps, jsonb objects).
describe("local pglite driver", () => {
  it("migrates lazily and round-trips the types the app depends on", async () => {
    const id = `u_${Date.now()}`;
    await db.insert(users).values({ id, email: `${id}@example.com`, name: "T" });
    const [doc] = await db
      .insert(scannedDocuments)
      .values({
        userId: id,
        title: "Lease",
        docType: "document",
        riskScore: 80,
        summaryJson: { analysis: { riskLevel: "HIGH" }, n: [1, 2] },
        noticeDeadlineDate: "2026-12-10",
        renewalDate: "2027-01-01",
      })
      .returning();

    const [row] = await db.select().from(scannedDocuments).where(eq(scannedDocuments.id, doc.id));
    expect(row.noticeDeadlineDate).toBe("2026-12-10"); // date stays a string, not a Date
    expect(row.renewalDate).toBe("2027-01-01");
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(row.summaryJson).toEqual({ analysis: { riskLevel: "HIGH" }, n: [1, 2] });

    const [u] = await db.select().from(users).where(eq(users.id, id));
    expect(u.plan).toBe("free");
    expect(u.createdAt).toBeInstanceOf(Date);

    await db.update(users).set({ plan: "pro" }).where(eq(users.id, id));
    const joined = await db
      .select({ title: scannedDocuments.title, plan: users.plan })
      .from(scannedDocuments)
      .innerJoin(users, eq(users.id, scannedDocuments.userId))
      .where(and(eq(users.plan, "pro"), eq(scannedDocuments.id, doc.id)));
    expect(joined).toEqual([{ title: "Lease", plan: "pro" }]);

    // idempotent claim pattern used by the alert cron
    const claim = { documentId: doc.id, kind: "notice", deadlineDate: "2026-12-10", threshold: 30 };
    expect(await db.insert(deadlineAlerts).values(claim).onConflictDoNothing().returning()).toHaveLength(1);
    expect(await db.insert(deadlineAlerts).values(claim).onConflictDoNothing().returning()).toHaveLength(0);

    // cascade delete + raw execute (used by /api/health)
    await db.delete(users).where(eq(users.id, id));
    expect(await db.select().from(scannedDocuments).where(eq(scannedDocuments.id, doc.id))).toHaveLength(0);
    await expect(db.execute(sql`select 1`)).resolves.toBeDefined();
  }, 60000);
});
