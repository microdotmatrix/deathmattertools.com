CREATE TABLE "v1_entry_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"status_changed_at" timestamp,
	"status_changed_by" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "v1_entry_feedback" ADD CONSTRAINT "v1_entry_feedback_entry_id_v1_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."v1_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_entry_feedback" ADD CONSTRAINT "v1_entry_feedback_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_entry_feedback" ADD CONSTRAINT "v1_entry_feedback_status_changed_by_v1_user_id_fk" FOREIGN KEY ("status_changed_by") REFERENCES "public"."v1_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entry_feedback_entry_id_idx" ON "v1_entry_feedback" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "entry_feedback_status_idx" ON "v1_entry_feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "entry_feedback_user_id_idx" ON "v1_entry_feedback" USING btree ("user_id");