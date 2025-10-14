CREATE TABLE "v1_chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"user_id" text NOT NULL,
	"entry_id" text NOT NULL,
	"document_id" uuid,
	"document_created_at" timestamp,
	"created_at" timestamp NOT NULL,
	"visibility" varchar DEFAULT 'private' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "v1_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"role" varchar NOT NULL,
	"parts" json NOT NULL,
	"attachments" json,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "v1_stream" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "v1_stream_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "v1_vote" (
	"chat_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"is_upvoted" boolean NOT NULL,
	CONSTRAINT "v1_vote_chat_id_message_id_pk" PRIMARY KEY("chat_id","message_id")
);
--> statement-breakpoint
CREATE TABLE "v1_document" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"entry_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"kind" varchar DEFAULT 'obituary' NOT NULL,
	"token_usage" integer DEFAULT 0,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "v1_document_id_created_at_pk" PRIMARY KEY("id","created_at")
);
--> statement-breakpoint
CREATE TABLE "v1_suggestion" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"document_created_at" timestamp NOT NULL,
	"original_text" text NOT NULL,
	"suggested_text" text NOT NULL,
	"description" text,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "v1_suggestion_id_created_at_pk" PRIMARY KEY("id","created_at")
);
--> statement-breakpoint
CREATE TABLE "v1_organization" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "v1_organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "v1_saved_quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"entry_id" text NOT NULL,
	"quote" text NOT NULL,
	"citation" text,
	"source" text,
	"length" varchar DEFAULT 'medium' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "v1_chat" ADD CONSTRAINT "v1_chat_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_chat" ADD CONSTRAINT "v1_chat_entry_id_v1_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."v1_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_chat" ADD CONSTRAINT "v1_chat_document_id_document_created_at_v1_document_id_created_at_fk" FOREIGN KEY ("document_id","document_created_at") REFERENCES "public"."v1_document"("id","created_at") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_message" ADD CONSTRAINT "v1_message_chat_id_v1_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."v1_chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_stream" ADD CONSTRAINT "v1_stream_chat_id_v1_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."v1_chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_vote" ADD CONSTRAINT "v1_vote_chat_id_v1_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."v1_chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_vote" ADD CONSTRAINT "v1_vote_message_id_v1_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."v1_message"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_document" ADD CONSTRAINT "v1_document_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_document" ADD CONSTRAINT "v1_document_entry_id_v1_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."v1_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_suggestion" ADD CONSTRAINT "v1_suggestion_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_suggestion" ADD CONSTRAINT "v1_suggestion_document_id_document_created_at_v1_document_id_created_at_fk" FOREIGN KEY ("document_id","document_created_at") REFERENCES "public"."v1_document"("id","created_at") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_saved_quotes" ADD CONSTRAINT "v1_saved_quotes_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_saved_quotes" ADD CONSTRAINT "v1_saved_quotes_entry_id_v1_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."v1_entry"("id") ON DELETE cascade ON UPDATE no action;