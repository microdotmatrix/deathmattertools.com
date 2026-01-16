CREATE TABLE "v1_pending_upload" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"url" text NOT NULL,
	"upload_type" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "v1_pending_upload_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "v1_pending_upload" ADD CONSTRAINT "v1_pending_upload_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE cascade ON UPDATE no action;