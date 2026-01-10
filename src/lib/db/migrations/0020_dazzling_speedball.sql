CREATE TABLE "v1_organization_details" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"business_name" text,
	"business_email" text,
	"business_phone" text,
	"website_url" text,
	"address_line_1" text,
	"address_line_2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"business_type" text,
	"license_number" text,
	"tax_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "v1_entry_details" ADD COLUMN "nickname" text;