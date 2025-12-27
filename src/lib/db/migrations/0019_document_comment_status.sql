ALTER TABLE "v1_document_comment" ADD COLUMN "status" varchar;
ALTER TABLE "v1_document_comment" ADD COLUMN "status_changed_at" timestamp;
ALTER TABLE "v1_document_comment" ADD COLUMN "status_changed_by" text;
--> statement-breakpoint
UPDATE "v1_document_comment" SET "status" = 'approved' WHERE "status" IS NULL;
--> statement-breakpoint
ALTER TABLE "v1_document_comment" ALTER COLUMN "status" SET DEFAULT 'pending';
ALTER TABLE "v1_document_comment" ALTER COLUMN "status" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD CONSTRAINT "v1_document_comment_status_changed_by_v1_user_id_fk" FOREIGN KEY ("status_changed_by") REFERENCES "public"."v1_user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "document_comment_status_idx" ON "v1_document_comment" USING btree ("document_id","status");
