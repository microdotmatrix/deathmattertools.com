import { text, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "../utils";

export const PageContentTable = pgTable("page_content", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export type PageContent = typeof PageContentTable.$inferSelect;
export type NewPageContent = typeof PageContentTable.$inferInsert;
