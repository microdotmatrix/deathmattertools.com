import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { DocumentTable } from "./documents";
import { UserGeneratedImageTable } from "./media";
import { UserTable } from "./users";

/**
 * Share Link Types
 * - document: Links to obituary/eulogy documents
 * - image: Links to memorial images
 */
export const SHARE_LINK_TYPES = ["document", "image"] as const;
export type ShareLinkType = (typeof SHARE_LINK_TYPES)[number];

/**
 * Share Link Table
 * Stores shareable link tokens for documents and images.
 * Each link can optionally allow guest commenting via email-based JWT.
 */
export const ShareLinkTable = pgTable(
  "share_link",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    // Token is a URL-safe random string used in the public URL
    token: text("token").notNull().unique(),
    // Type of resource being shared
    type: varchar("type", { enum: SHARE_LINK_TYPES }).notNull(),
    // Reference to the document (nullable for images)
    documentId: uuid("document_id"),
    documentCreatedAt: timestamp("document_created_at"),
    // Reference to the image (nullable for documents)
    imageId: text("image_id"),
    // Who created this share link
    createdBy: text("created_by")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    // Entry ID for context (always required for access control)
    entryId: text("entry_id").notNull(),
    // Optional expiration date
    expiresAt: timestamp("expires_at"),
    // Whether the link is currently active
    isEnabled: boolean("is_enabled").notNull().default(true),
    // Whether guests can comment on this shared content
    allowComments: boolean("allow_comments").notNull().default(false),
    // Optional password protection (hashed)
    passwordHash: text("password_hash"),
    // View tracking
    viewCount: integer("view_count").notNull().default(0),
    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("share_link_token_idx").on(table.token),
    index("share_link_document_idx").on(table.documentId),
    index("share_link_image_idx").on(table.imageId),
    index("share_link_entry_idx").on(table.entryId),
  ]
);

export const ShareLinkRelations = relations(ShareLinkTable, ({ one }) => ({
  createdByUser: one(UserTable, {
    fields: [ShareLinkTable.createdBy],
    references: [UserTable.id],
  }),
  document: one(DocumentTable, {
    fields: [ShareLinkTable.documentId, ShareLinkTable.documentCreatedAt],
    references: [DocumentTable.id, DocumentTable.createdAt],
  }),
  image: one(UserGeneratedImageTable, {
    fields: [ShareLinkTable.imageId],
    references: [UserGeneratedImageTable.id],
  }),
}));

/**
 * Guest Commenter Table
 * Tracks guest users who comment via share links.
 * Linked to comments via their unique JWT-derived ID.
 */
export const GuestCommenterTable = pgTable(
  "guest_commenter",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    // Email address used to verify guest identity
    email: text("email").notNull(),
    // Display name for the guest
    name: text("name").notNull(),
    // Share link used to access
    shareLinkId: uuid("share_link_id")
      .notNull()
      .references(() => ShareLinkTable.id, { onDelete: "cascade" }),
    // Token hash for JWT verification (last 8 chars of token for lookup)
    tokenFingerprint: text("token_fingerprint").notNull(),
    // Whether email has been verified
    emailVerified: boolean("email_verified").notNull().default(false),
    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    lastAccessedAt: timestamp("last_accessed_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("guest_commenter_email_idx").on(table.email, table.shareLinkId),
    index("guest_commenter_fingerprint_idx").on(table.tokenFingerprint),
  ]
);

export const GuestCommenterRelations = relations(
  GuestCommenterTable,
  ({ one }) => ({
    shareLink: one(ShareLinkTable, {
      fields: [GuestCommenterTable.shareLinkId],
      references: [ShareLinkTable.id],
    }),
  })
);

// Type exports
export type ShareLink = typeof ShareLinkTable.$inferSelect;
export type ShareLinkInsert = typeof ShareLinkTable.$inferInsert;
export type GuestCommenter = typeof GuestCommenterTable.$inferSelect;
export type GuestCommenterInsert = typeof GuestCommenterTable.$inferInsert;
