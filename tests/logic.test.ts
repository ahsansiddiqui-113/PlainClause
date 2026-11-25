import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildAlertEmail, daysUntil, tightestThreshold } from "@/lib/alerts";
import { isEntitled, verifySignature } from "@/lib/billing";
import {
  decodeItems,
  depositSummary,
  encodeItems,
  noticeDeadline,
  proratedRent,
} from "@/lib/calculators";
import { buildDeadlines, riskTier, urgency } from "@/lib/deadlines";
import { toCsv } from "@/lib/exports";
import { safeNext } from "@/lib/safe-next";
import { isAdRoute } from "@/lib/ads";
import type { StoredDocument } from "@/lib/vault";

describe("calculators", () => {
  it("notice deadline: statuses and arithmetic", () => {
    const today = new Date(2026, 10, 25);
    const r = noticeDeadline(new Date(2027, 0, 31), 60, today);
    expect(r.deadline).toEqual(new Date(2026, 11, 2));
    expect(r.status).toBe("upcoming");
    expect(noticeDeadline(new Date(2026, 10, 25), 0, today).status).toBe("today");
    expect(noticeDeadline(new Date(2026, 10, 30), 30, today).status).toBe("passed");
  });
  it("prorates the first month, counting move-in day", () => {
    const r = proratedRent(3000, new Date(2026, 5, 16)); // June: 30 days, 15 charged
    expect(r).toMatchObject({ daysInMonth: 30, daysCharged: 15, amount: 1500 });
    expect(proratedRent(1000, new Date(2026, 1, 1)).amount).toBe(1000); // full Feb
  });
  it("deposit summary and item (de)serialisation round-trip", () => {
    const items = [{ label: "Paint", amount: 120.5 }, { label: "Carpet & rug", amount: 80 }];
    expect(decodeItems(encodeItems(items))).toEqual(items);
    expect(decodeItems("garbage%%")).toEqual([]);
    expect(depositSummary(1000, items)).toMatchObject({ totalDeductions: 200.5, refund: 799.5 });
  });
});

describe("deadlines", () => {
  it("risk tiers", () => {
    expect([riskTier(null), riskTier(10), riskTier(40), riskTier(70)]).toEqual(["none", "low", "medium", "high"]);
  });
  it("keeps upcoming + recently passed, drops old/far, sorts by date", () => {
    const today = new Date(2026, 10, 25);
    const docs = [
      { id: "a", title: "A", noticeDeadlineDate: "2026-12-10", renewalDate: null },
      { id: "b", title: "B", noticeDeadlineDate: "2026-11-20", renewalDate: "2027-01-01" },
      { id: "c", title: "C", noticeDeadlineDate: "2026-10-01", renewalDate: null }, // too old
    ];
    const out = buildDeadlines(docs, today);
    expect(out.map((d) => d.docId)).toEqual(["b", "a", "b"]);
    expect(out[0].daysLeft).toBe(-5);
  });
  it("urgency labels", () => {
    expect(urgency(-3).label).toBe("3d overdue");
    expect(urgency(0).label).toBe("Today");
    expect(urgency(20).cls).toContain("amber");
  });
});

describe("alerts", () => {
  const now = new Date("2026-11-25T13:00:00Z");
  it("counts whole UTC days", () => {
    expect(daysUntil("2026-11-25", now)).toBe(0);
    expect(daysUntil("2026-12-25", now)).toBe(30);
    expect(daysUntil("2026-11-24", now)).toBe(-1);
  });
  it("picks the tightest reached threshold", () => {
    expect(tightestThreshold(31)).toBeNull();
    expect(tightestThreshold(-1)).toBeNull();
    expect([30, 20, 14, 10, 3, 0].map(tightestThreshold)).toEqual([30, 30, 14, 14, 3, 3]);
  });
  it("email escapes titles and orders soonest first", () => {
    const e = buildAlertEmail([
      { docId: "1", title: "<script>x</script>", kind: "renewal", date: "2026-12-20", daysLeft: 25 },
      { docId: "2", title: "Lease", kind: "notice", date: "2026-11-26", daysLeft: 1 },
    ]);
    expect(e.html).not.toContain("<script>");
    expect(e.html.indexOf("Lease")).toBeLessThan(e.html.indexOf("&lt;script&gt;"));
    expect(e.subject).toBe("2 contract deadlines coming up");
    expect(e.text).toContain("tomorrow");
  });
});

describe("billing", () => {
  it("entitlement by status", () => {
    const now = new Date("2026-11-25T00:00:00Z");
    const future = new Date("2027-01-01T00:00:00Z");
    const past = new Date("2026-11-01T00:00:00Z");
    expect(isEntitled("active", null, now)).toBe(true);
    expect(isEntitled("on_trial", null, now)).toBe(true);
    expect(isEntitled("past_due", null, now)).toBe(true);
    expect(isEntitled("cancelled", future, now)).toBe(true);
    expect(isEntitled("cancelled", past, now)).toBe(false);
    expect(isEntitled("cancelled", null, now)).toBe(false);
    for (const s of ["paused", "unpaid", "expired", "weird"]) expect(isEntitled(s, future, now)).toBe(false);
  });
  it("verifies HMAC signatures in constant time and rejects junk", () => {
    const body = '{"a":1}';
    const sig = createHmac("sha256", "s3cret").update(body).digest("hex");
    expect(verifySignature(body, sig, "s3cret")).toBe(true);
    expect(verifySignature(body + " ", sig, "s3cret")).toBe(false);
    expect(verifySignature(body, sig, "other")).toBe(false);
    expect(verifySignature(body, null, "s3cret")).toBe(false);
    expect(verifySignature(body, "zz", "s3cret")).toBe(false);
    expect(verifySignature(body, sig.slice(0, 10), "s3cret")).toBe(false);
    expect(verifySignature(body, sig, "")).toBe(false);
  });
});

describe("csv export", () => {
  const doc = (title: string): StoredDocument => ({
    id: "1", title, docType: "document", riskScore: 80, renewalDate: null, noticeDeadlineDate: null,
    createdAt: new Date("2026-11-25"), analysis: null, sourceText: null, fileName: null, pagesRead: null, totalPages: null,
  });
  it("neutralises spreadsheet formula injection and escapes quotes", () => {
    for (const bad of ["=HYPERLINK(\"x\")", "+1+1", "-2+3", "@SUM(A1)"]) {
      expect(toCsv([doc(bad)])).toContain(`"'${bad.replace(/"/g, '""')}"`);
    }
    expect(toCsv([doc('He said "hi"')])).toContain('"He said ""hi"""');
  });
});

describe("safeNext (open-redirect guard)", () => {
  it("allows only same-site relative paths", () => {
    expect(safeNext("/dashboard/exports")).toBe("/dashboard/exports");
    for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "", null, undefined]) {
      expect(safeNext(bad as string | null | undefined)).toBe("/dashboard");
    }
  });
});

describe("ad routes", () => {
  it("content pages only", () => {
    for (const ok of ["/", "/blog", "/blog/x", "/tools/clause-scanner"]) expect(isAdRoute(ok)).toBe(true);
    for (const no of ["/dashboard", "/dashboard/billing", "/login", "/pricing", "/import", "/legal/privacy", null]) {
      expect(isAdRoute(no as string | null)).toBe(false);
    }
  });
});
