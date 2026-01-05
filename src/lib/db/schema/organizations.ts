import { relations } from "drizzle-orm";
import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { UserTable } from "./users";

export const OrganizationTable = pgTable("organization", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const OrganizationRelations = relations(
  OrganizationTable,
  ({ many }) => ({
    users: many(UserTable),
  })
);

// Organization details table - stores extended info that Clerk doesn't support
// Uses Clerk's organization ID as the primary key (text, not uuid)
export const OrganizationDetailsTable = pgTable("organization_details", {
  // Clerk organization ID (text format like "org_xxxxx")
  organizationId: text("organization_id").primaryKey(),

  // Business contact information
  businessName: text("business_name"), // Legal/DBA name if different from Clerk org name
  businessEmail: text("business_email"),
  businessPhone: text("business_phone"),
  websiteUrl: text("website_url"),

  // Address
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),

  // Additional business details
  businessType: text("business_type"), // e.g., "funeral_home", "cemetery", "hospice", etc.
  licenseNumber: text("license_number"),
  taxId: text("tax_id"),

  // Timestamps
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const OrganizationDetailsRelations = relations(
  OrganizationDetailsTable,
  () => ({
    // No direct relation to OrganizationTable since that uses UUID
    // and Clerk orgs use text IDs - they're linked conceptually via Clerk
  })
);

export type Organization = typeof OrganizationTable.$inferSelect;
export type OrganizationDetails = typeof OrganizationDetailsTable.$inferSelect;
export type NewOrganizationDetails = typeof OrganizationDetailsTable.$inferInsert;
