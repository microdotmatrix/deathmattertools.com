ALTER TABLE "v1_saved_quotes" ADD COLUMN "type" text DEFAULT 'quote' NOT NULL;--> statement-breakpoint
ALTER TABLE "v1_saved_quotes" ADD COLUMN "faith" text;--> statement-breakpoint
ALTER TABLE "v1_saved_quotes" ADD COLUMN "book" text;--> statement-breakpoint
ALTER TABLE "v1_saved_quotes" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "v1_saved_quotes" ADD COLUMN "used_in_obituary" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "v1_saved_quotes" ADD COLUMN "used_in_image" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "saved_quotes_entry_id_idx" ON "v1_saved_quotes" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "saved_quotes_type_idx" ON "v1_saved_quotes" USING btree ("type");--> statement-breakpoint
CREATE INDEX "saved_quotes_faith_idx" ON "v1_saved_quotes" USING btree ("faith");