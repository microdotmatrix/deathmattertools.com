ALTER TABLE "v1_document_comment" DROP CONSTRAINT "v1_document_comment_id_unique";--> statement-breakpoint
ALTER TABLE "v1_document_comment" DROP CONSTRAINT "v1_document_comment_parent_id_v1_document_comment_id_fk";
--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD CONSTRAINT "document_comment_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."v1_document_comment"("id") ON DELETE cascade ON UPDATE no action;