CREATE TYPE "public"."plan" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text NOT NULL,
	"window_start" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
CREATE TABLE "scanned_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"doc_type" text NOT NULL,
	"risk_score" integer,
	"summary_json" jsonb,
	"renewal_date" date,
	"notice_deadline_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"provider_sub_id" text NOT NULL,
	"status" text NOT NULL,
	"current_period_end" timestamp with time zone,
	CONSTRAINT "subscriptions_provider_sub_id_unique" UNIQUE("provider_sub_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"free_scans_used_today" integer DEFAULT 0 NOT NULL,
	"last_scan_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"event_name" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scanned_documents" ADD CONSTRAINT "scanned_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "scanned_documents_user_idx" ON "scanned_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "scanned_documents_notice_idx" ON "scanned_documents" USING btree ("notice_deadline_date");--> statement-breakpoint
CREATE INDEX "scanned_documents_renewal_idx" ON "scanned_documents" USING btree ("renewal_date");--> statement-breakpoint
CREATE INDEX "subscriptions_user_idx" ON "subscriptions" USING btree ("user_id");