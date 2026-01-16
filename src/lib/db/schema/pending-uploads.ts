import { relations } from "drizzle-orm";
import { text, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { UserTable } from "./users";

/**
 * Tracks uploads that are pending association with an entry.
 * Used for cleanup of orphaned uploads when users abandon the entry creation form.
 */
export const PendingUploadTable = pgTable("pending_upload", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  key: text("key").notNull().unique(),
  url: text("url").notNull(),
  uploadType: text("upload_type").notNull(), // "entry_profile" | "entry_gallery"
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const PendingUploadRelations = relations(PendingUploadTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [PendingUploadTable.userId],
    references: [UserTable.id],
  }),
}));

export type PendingUpload = typeof PendingUploadTable.$inferSelect;
export type NewPendingUpload = typeof PendingUploadTable.$inferInsert;
