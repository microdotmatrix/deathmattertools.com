import { relations } from "drizzle-orm";
import { boolean, index, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { EntryTable } from "./entries";
import { UserTable } from "./users";

export const SavedQuotesTable = pgTable("saved_quotes", {
  id: serial("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  entryId: text("entry_id")
    .notNull()
    .references(() => EntryTable.id, { onDelete: "cascade" }),
  
  // Core content
  quote: text("quote").notNull(),
  citation: text("citation"),
  source: text("source"),
  
  // Enhanced categorization
  type: text("type").notNull().default("quote"),
  faith: text("faith"),
  book: text("book"),
  reference: text("reference"),
  
  length: varchar("length", { enum: ["short", "medium", "long"] })
    .notNull()
    .default("medium"),
  
  // Usage tracking
  usedInObituary: boolean("used_in_obituary").default(false),
  usedInImage: boolean("used_in_image").default(false),
  
  // Metadata
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  entryIdIdx: index("saved_quotes_entry_id_idx").on(table.entryId),
  typeIdx: index("saved_quotes_type_idx").on(table.type),
  faithIdx: index("saved_quotes_faith_idx").on(table.faith),
}));

export const SavedQuotesRelations = relations(SavedQuotesTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [SavedQuotesTable.userId],
    references: [UserTable.id],
  }),
  entry: one(EntryTable, {
    fields: [SavedQuotesTable.entryId],
    references: [EntryTable.id],
  }),
}));

export type SavedQuote = typeof SavedQuotesTable.$inferSelect;
export type QuoteType = "quote" | "scripture" | "axiom";
export type FaithTradition = "Christianity" | "Islam";
