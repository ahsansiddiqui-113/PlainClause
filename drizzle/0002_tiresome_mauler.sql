ALTER TABLE "subscriptions" ADD COLUMN "ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "interval" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "portal_url" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "provider_updated_at" timestamp with time zone;