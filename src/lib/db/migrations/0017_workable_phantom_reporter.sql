ALTER TABLE "v1_document" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "v1_entry" DROP COLUMN "status";