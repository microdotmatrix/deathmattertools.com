CREATE TABLE "v1_system_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"type" text NOT NULL,
	"source" text NOT NULL,
	"user_id" text,
	"entry_id" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"priority" text,
	"metadata" jsonb,
	"internal_notes" text
);
--> statement-breakpoint
ALTER TABLE "v1_system_feedback" ADD CONSTRAINT "v1_system_feedback_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_system_feedback" ADD CONSTRAINT "v1_system_feedback_entry_id_v1_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."v1_entry"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "system_feedback_type_idx" ON "v1_system_feedback" USING btree ("type");--> statement-breakpoint
CREATE INDEX "system_feedback_status_idx" ON "v1_system_feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "system_feedback_user_id_idx" ON "v1_system_feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "system_feedback_created_at_idx" ON "v1_system_feedback" USING btree ("created_at");