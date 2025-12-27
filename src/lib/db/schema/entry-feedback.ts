import { relations } from "drizzle-orm";
import { index, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { EntryTable } from "./entries";
import { UserTable } from "./users";

export const EntryFeedbackTable = pgTable(
  "entry_feedback",
  {
    id: uuid("id").notNull().defaultRandom().primaryKey(),
    entryId: text("entry_id")
      .notNull()
      .references(() => EntryTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    targetKey: text("target_key"),
    status: text("status", {
      enum: ["pending", "approved", "denied", "resolved"],
    })
      .notNull()
      .default("pending"),
    statusChangedAt: timestamp("status_changed_at"),
    statusChangedBy: text("status_changed_by").references(() => UserTable.id),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("entry_feedback_entry_id_idx").on(table.entryId),
    index("entry_feedback_status_idx").on(table.status),
    index("entry_feedback_user_id_idx").on(table.userId),
  ]
);

export const EntryFeedbackRelations = relations(
  EntryFeedbackTable,
  ({ one }) => ({
    entry: one(EntryTable, {
      fields: [EntryFeedbackTable.entryId],
      references: [EntryTable.id],
    }),
    user: one(UserTable, {
      fields: [EntryFeedbackTable.userId],
      references: [UserTable.id],
    }),
    statusChanger: one(UserTable, {
      fields: [EntryFeedbackTable.statusChangedBy],
      references: [UserTable.id],
    }),
  })
);

export type EntryFeedback = typeof EntryFeedbackTable.$inferSelect;
export type EntryFeedbackStatus = EntryFeedback["status"];

export interface EntryFeedbackWithUser extends EntryFeedback {
  user: {
    id: string;
    email: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface EntryFeedbackWithDetails extends EntryFeedbackWithUser {
  entry: {
    id: string;
    userId: string;
    name: string;
  };
}
