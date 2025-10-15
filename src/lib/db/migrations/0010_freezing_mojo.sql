ALTER TABLE "v1_document_comment" ADD COLUMN "anchor_start" integer;--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD COLUMN "anchor_end" integer;--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD COLUMN "anchor_text" text;--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD COLUMN "anchor_prefix" text;--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD COLUMN "anchor_suffix" text;--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD COLUMN "anchor_valid" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD COLUMN "anchor_status" varchar DEFAULT 'pending' NOT NULL;