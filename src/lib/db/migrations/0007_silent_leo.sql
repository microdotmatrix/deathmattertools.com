ALTER TABLE "v1_document_comment" DROP CONSTRAINT "document_comment_parent_fk";
--> statement-breakpoint
ALTER TABLE "v1_entry" ADD COLUMN "organization_id" text;