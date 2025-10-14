CREATE TABLE "v1_entry_details" (
	"entry_id" text NOT NULL,
	"occupation" text,
	"job_title" text,
	"company_name" text,
	"years_worked" text,
	"education" text,
	"accomplishments" text,
	"milestones" text,
	"biographical_summary" text,
	"hobbies" text,
	"personal_interests" text,
	"military_service" boolean,
	"military_branch" text,
	"military_rank" text,
	"military_years_served" integer,
	"religious" boolean,
	"denomination" text,
	"organization" text,
	"favorite_scripture" text,
	"family_details" text,
	"survived_by" text,
	"preceded_by" text,
	"service_details" text,
	"donation_requests" text,
	"special_acknowledgments" text,
	"additional_notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "v1_entry_details_entry_id_unique" UNIQUE("entry_id")
);
--> statement-breakpoint
CREATE TABLE "v1_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"date_of_birth" timestamp,
	"date_of_death" timestamp,
	"location_born" text,
	"location_died" text,
	"image" text,
	"cause_of_death" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "v1_user_generated_image" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"entry_id" text NOT NULL,
	"epitaph_id" integer NOT NULL,
	"template_id" text,
	"image_url" text,
	"metadata" json,
	"status" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "v1_user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"notifications" boolean DEFAULT true NOT NULL,
	"cookies" boolean DEFAULT false NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "v1_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"image_url" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "v1_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "v1_user_upload" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"storage_provider" text NOT NULL,
	"storage_key" text NOT NULL,
	"metadata" json,
	"is_public" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
DROP TABLE "template_post" CASCADE;--> statement-breakpoint
ALTER TABLE "v1_entry_details" ADD CONSTRAINT "v1_entry_details_entry_id_v1_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."v1_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_entry" ADD CONSTRAINT "v1_entry_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_user_generated_image" ADD CONSTRAINT "v1_user_generated_image_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_user_generated_image" ADD CONSTRAINT "v1_user_generated_image_entry_id_v1_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."v1_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_user_settings" ADD CONSTRAINT "v1_user_settings_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_user_upload" ADD CONSTRAINT "v1_user_upload_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE cascade ON UPDATE no action;