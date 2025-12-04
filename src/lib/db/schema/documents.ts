import { relations } from "drizzle-orm";
import {
    boolean,
    foreignKey,
    integer,
    primaryKey,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { pgTable } from "../utils";
import { EntryTable } from "./entries";
import { UserTable } from "./users";

export const DocumentTable = pgTable(
  "document",
  {
    id: uuid("id").notNull().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => UserTable.id),
    entryId: text("entry_id")
      .notNull()
      .references(() => EntryTable.id, { onDelete: "cascade" }),
    organizationId: text("organization_id"),
    organizationCommentingEnabled: boolean(
      "organization_commenting_enabled"
    )
      .notNull()
      .default(false),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("kind", { enum: ["obituary", "eulogy"] })
      .notNull()
      .default("obituary"),
    tokenUsage: integer("token_usage").default(0),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => {
    return [
      primaryKey({ columns: [table.id, table.createdAt] }),
    ];
  }
);

export const DocumentRelations = relations(DocumentTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [DocumentTable.userId],
    references: [UserTable.id],
  }),
  entry: one(EntryTable, {
    fields: [DocumentTable.entryId],
    references: [EntryTable.id],
  }),
}));

export const DocumentCommentTable = pgTable(
  "document_comment",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("document_id").notNull(),
    documentCreatedAt: timestamp("document_created_at").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
    
    // Text anchor fields (nullable for backward compatibility)
    anchorStart: integer("anchor_start"),
    anchorEnd: integer("anchor_end"),
    anchorText: text("anchor_text"),
    anchorPrefix: text("anchor_prefix"),
    anchorSuffix: text("anchor_suffix"),
    anchorValid: boolean("anchor_valid").notNull().default(true),
    anchorStatus: varchar("anchor_status", { 
      enum: ["pending", "approved", "denied"] 
    }).notNull().default("pending"),
  },
  (table) => [
    primaryKey({ columns: [table.id, table.createdAt] }),
    foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [DocumentTable.id, DocumentTable.createdAt],
      name: "document_comment_document_fk",
    }).onDelete("cascade"),
  ]
);

export const DocumentCommentRelations = relations(
  DocumentCommentTable,
  ({ one }) => ({
    document: one(DocumentTable, {
      fields: [
        DocumentCommentTable.documentId,
        DocumentCommentTable.documentCreatedAt,
      ],
      references: [DocumentTable.id, DocumentTable.createdAt],
    }),
    user: one(UserTable, {
      fields: [DocumentCommentTable.userId],
      references: [UserTable.id],
    }),
    parent: one(DocumentCommentTable, {
      fields: [DocumentCommentTable.parentId],
      references: [DocumentCommentTable.id],
    }),
  })
);

export const SuggestionTable = pgTable(
  "suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("document_id").notNull(),
    documentCreatedAt: timestamp("document_created_at").notNull(),
    originalText: text("original_text").notNull(),
    suggestedText: text("suggested_text").notNull(),
    description: text("description"),
    isResolved: boolean("is_resolved").notNull().default(false),
    userId: text("user_id")
      .notNull()
      .references(() => UserTable.id),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id, table.createdAt] }),
    foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [DocumentTable.id, DocumentTable.createdAt],
    }),
  ]
);

export const SuggestionRelations = relations(SuggestionTable, ({ one }) => ({
  document: one(DocumentTable, {
    fields: [SuggestionTable.documentId, SuggestionTable.documentCreatedAt],
    references: [DocumentTable.id, DocumentTable.createdAt],
  }),
}));

export type Document = typeof DocumentTable.$inferSelect;
export type DocumentComment = typeof DocumentCommentTable.$inferSelect;
export type Suggestion = typeof SuggestionTable.$inferSelect;

// Anchor types
export type AnchorStatus = "pending" | "approved" | "denied";

export interface CommentAnchor {
  start: number;
  end: number;
  text: string;
  prefix: string;
  suffix: string;
  valid: boolean;
  status: AnchorStatus;
}

export interface DocumentCommentWithAnchor extends DocumentComment {
  anchor: CommentAnchor | null;
}
