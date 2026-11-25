CREATE TABLE "deadline_alerts" (
	"document_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"deadline_date" date NOT NULL,
	"threshold" integer NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "deadline_alerts_document_id_kind_deadline_date_threshold_pk" PRIMARY KEY("document_id","kind","deadline_date","threshold")
);
--> statement-breakpoint
ALTER TABLE "deadline_alerts" ADD CONSTRAINT "deadline_alerts_document_id_scanned_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."scanned_documents"("id") ON DELETE cascade ON UPDATE no action;