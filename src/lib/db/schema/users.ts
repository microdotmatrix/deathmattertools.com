import { relations } from "drizzle-orm";
import { boolean, text, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { EntryTable } from "./entries";
import { UserGeneratedImageTable } from "./media";
import { SavedQuotesTable } from "./quotes";
import { UserSettingsTable } from "./settings";

export const UserTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const UserRelations = relations(UserTable, ({ many, one }) => ({
  uploads: many(UserUploadTable),
  entries: many(EntryTable),
  settings: one(UserSettingsTable, {
    fields: [UserTable.id],
    references: [UserSettingsTable.userId],
  }),
  generatedImages: many(UserGeneratedImageTable),
  savedQuotes: many(SavedQuotesTable),
}));

export const UserUploadTable = pgTable("user_upload", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  entryId: text("entry_id")
    .notNull()
    .references(() => EntryTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  key: text("key").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const UserUploadRelations = relations(UserUploadTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [UserUploadTable.userId],
    references: [UserTable.id],
  }),
  entry: one(EntryTable, {
    fields: [UserUploadTable.entryId],
    references: [EntryTable.id],
  }),
}));

export type User = typeof UserTable.$inferSelect;
export type UserUpload = typeof UserUploadTable.$inferSelect;