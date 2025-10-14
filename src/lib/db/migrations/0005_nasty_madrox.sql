CREATE TABLE "v1_document_comment" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"document_created_at" timestamp NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "v1_document_comment_id_created_at_pk" PRIMARY KEY("id","created_at"),
	CONSTRAINT "v1_document_comment_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "v1_document" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "v1_document" ADD COLUMN "organization_commenting_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD CONSTRAINT "v1_document_comment_user_id_v1_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."v1_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD CONSTRAINT "v1_document_comment_parent_id_v1_document_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."v1_document_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "v1_document_comment" ADD CONSTRAINT "document_comment_document_fk" FOREIGN KEY ("document_id","document_created_at") REFERENCES "public"."v1_document"("id","created_at") ON DELETE cascade ON UPDATE no action;