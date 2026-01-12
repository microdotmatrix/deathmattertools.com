CREATE TABLE "v1_guest_commenter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"share_link_id" uuid NOT NULL,
	"token_fingerprint" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp NOT NULL,
	"last_accessed_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "v1_share_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"type" varchar NOT NULL,
	"document_id" uuid,
	"document_created_at" timestamp,
	"image_id" text,
	"created_by" text NOT NULL,
	"entry_id" text NOT NULL,
	"expires_at" timestamp,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"allow_comments" boolean DEFAULT false NOT NULL,
	"password_hash" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "v1_share_link_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "v1_document_comment" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD COLUMN "guest_commenter_id" uuid;--> statement-breakpoint
ALTER TABLE "v1_guest_commenter" ADD CONSTRAINT "v1_guest_commenter_share_link_id_v1_share_link_id_fk" FOREIGN KEY ("share_link_id") REFERENCES "public"."v1_share_link"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_share_link" ADD CONSTRAINT "v1_share_link_created_by_v1_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."v1_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guest_commenter_email_idx" ON "v1_guest_commenter" USING btree ("email","share_link_id");--> statement-breakpoint
CREATE INDEX "guest_commenter_fingerprint_idx" ON "v1_guest_commenter" USING btree ("token_fingerprint");--> statement-breakpoint
CREATE INDEX "share_link_token_idx" ON "v1_share_link" USING btree ("token");--> statement-breakpoint
CREATE INDEX "share_link_document_idx" ON "v1_share_link" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "share_link_image_idx" ON "v1_share_link" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "share_link_entry_idx" ON "v1_share_link" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "document_comment_guest_idx" ON "v1_document_comment" USING btree ("guest_commenter_id");