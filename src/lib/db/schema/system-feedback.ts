import { relations } from "drizzle-orm";
import { index, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { EntryTable } from "./entries";
import { UserTable } from "./users";

export const SystemFeedbackTable = pgTable(
  "system_feedback",
  {
    id: uuid("id").notNull().defaultRandom().primaryKey(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
    
    // Core categorization
    type: text("type", {
      enum: ["contact", "feature_request", "bug", "other"],
    }).notNull(),
    source: text("source").notNull(), // e.g., "contact_page", "feature_request_card", "inline_survey"
    
    // Optional references
    userId: text("user_id").references(() => UserTable.id, { onDelete: "set null" }),
    entryId: text("entry_id").references(() => EntryTable.id, { onDelete: "set null" }),
    
    // Content
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    
    // Admin triage
    status: text("status", {
      enum: ["new", "in_review", "resolved", "dismissed"],
    })
      .notNull()
      .default("new"),
    priority: text("priority", {
      enum: ["low", "medium", "high"],
    }),
    
    // Flexible metadata (e.g., URL, user agent, screenshots, survey responses)
    metadata: jsonb("metadata"),
    
    // Admin notes
    internalNotes: text("internal_notes"),
  },
  (table) => [
    index("system_feedback_type_idx").on(table.type),
    index("system_feedback_status_idx").on(table.status),
    index("system_feedback_user_id_idx").on(table.userId),
    index("system_feedback_created_at_idx").on(table.createdAt),
  ]
);

export const SystemFeedbackRelations = relations(
  SystemFeedbackTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [SystemFeedbackTable.userId],
      references: [UserTable.id],
    }),
    entry: one(EntryTable, {
      fields: [SystemFeedbackTable.entryId],
      references: [EntryTable.id],
    }),
  })
);

export type SystemFeedback = typeof SystemFeedbackTable.$inferSelect;
export type NewSystemFeedback = typeof SystemFeedbackTable.$inferInsert;

// Extended types with relations
export interface SystemFeedbackWithUser extends SystemFeedback {
  user: {
    id: string;
    email: string;
    name: string;
    imageUrl: string | null;
  } | null;
}
