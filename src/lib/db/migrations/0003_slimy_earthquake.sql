ALTER TABLE "v1_user_upload" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "v1_user_upload" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "v1_user_upload" ADD COLUMN "entry_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "v1_user_upload" ADD COLUMN "key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "v1_user_upload" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "v1_user_upload" ADD CONSTRAINT "v1_user_upload_entry_id_v1_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."v1_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_user_upload" DROP COLUMN "file_name";--> statement-breakpoint
ALTER TABLE "v1_user_upload" DROP COLUMN "file_type";--> statement-breakpoint
ALTER TABLE "v1_user_upload" DROP COLUMN "file_size";--> statement-breakpoint
ALTER TABLE "v1_user_upload" DROP COLUMN "thumbnail_url";--> statement-breakpoint
ALTER TABLE "v1_user_upload" DROP COLUMN "storage_provider";--> statement-breakpoint
ALTER TABLE "v1_user_upload" DROP COLUMN "storage_key";--> statement-breakpoint
ALTER TABLE "v1_user_upload" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "v1_user_upload" DROP COLUMN "is_public";