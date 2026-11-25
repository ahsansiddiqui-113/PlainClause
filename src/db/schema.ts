import {
  pgTable,
  pgEnum,
  text,
  integer,
  timestamp,
  date,
  jsonb,
  uuid,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  plan: planEnum("plan").notNull().default("free"),
  freeScansUsedToday: integer("free_scans_used_today").notNull().default(0),
  lastScanDate: date("last_scan_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerSubId: text("provider_sub_id").notNull().unique(),
    status: text("status").notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  },
  (t) => [index("subscriptions_user_idx").on(t.userId)],
);

export const scannedDocuments = pgTable(
  "scanned_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    docType: text("doc_type").notNull(),
    riskScore: integer("risk_score"),
    summaryJson: jsonb("summary_json"),
    renewalDate: date("renewal_date"),
    noticeDeadlineDate: date("notice_deadline_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("scanned_documents_user_idx").on(t.userId),
    index("scanned_documents_notice_idx").on(t.noticeDeadlineDate),
    index("scanned_documents_renewal_idx").on(t.renewalDate),
  ],
);

// Idempotency log for billing webhooks.
export const webhookEvents = pgTable("webhook_events", {
  eventId: text("event_id").primaryKey(),
  eventName: text("event_name").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

// Fixed-window counters for anonymous/IP and per-user rate limiting.
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(), // e.g. "scan:ip:1.2.3.4"
    windowStart: date("window_start").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
);

export type User = typeof users.$inferSelect;
export type ScannedDocument = typeof scannedDocuments.$inferSelect;
