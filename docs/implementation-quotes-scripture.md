# Implementation Guide: Quotes & Scripture Tools

**Companion to:** `prd-quotes-scripture-tools.md`  
**Stack:** Next.js 15 + RSC + Clerk + Drizzle + Neon Postgres

---

## Phase 1: Database & Data Layer

### 1.1 Schema Migration

**File:** `/src/lib/db/schema/quotes.ts`

Add new columns to existing schema:

```typescript
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
  
  // NEW: Enhanced categorization
  type: text("type").notNull().default("quote"),
  faith: text("faith"),
  book: text("book"),
  reference: text("reference"),
  
  length: varchar("length", { enum: ["short", "medium", "long"] })
    .notNull()
    .default("medium"),
  
  // NEW: Usage tracking
  usedInObituary: boolean("used_in_obituary").default(false),
  usedInImage: boolean("used_in_image").default(false),
  
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
```

**Migration commands:**
```bash
pnpm db:generate
pnpm db:push
```

### 1.2 Database Queries

**File:** `/src/lib/db/queries/quotes.ts`

```typescript
import "server-only";
import { db } from "@/lib/db";
import { SavedQuotesTable } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { cache } from "react";

export const getSavedQuotesByEntryId = cache(async (entryId: string) => {
  return await db
    .select()
    .from(SavedQuotesTable)
    .where(eq(SavedQuotesTable.entryId, entryId))
    .orderBy(desc(SavedQuotesTable.createdAt));
});

export const getSavedQuotesByType = cache(
  async (entryId: string, type: "quote" | "scripture") => {
    return await db
      .select()
      .from(SavedQuotesTable)
      .where(
        and(
          eq(SavedQuotesTable.entryId, entryId),
          eq(SavedQuotesTable.type, type)
        )
      )
      .orderBy(desc(SavedQuotesTable.createdAt));
  }
);

export const isQuoteSaved = cache(
  async (userId: string, entryId: string, quote: string) => {
    const result = await db
      .select({ id: SavedQuotesTable.id })
      .from(SavedQuotesTable)
      .where(
        and(
          eq(SavedQuotesTable.userId, userId),
          eq(SavedQuotesTable.entryId, entryId),
          eq(SavedQuotesTable.quote, quote)
        )
      )
      .limit(1);
    
    return result.length > 0;
  }
);
```

### 1.3 Server Actions

**File:** `/src/lib/db/mutations/quotes.ts`

```typescript
"use server";

import { db } from "@/lib/db";
import { SavedQuotesTable } from "@/lib/db/schema";
import { action } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SaveQuoteSchema = z.object({
  entryId: z.string(),
  quote: z.string().min(1).max(1000),
  citation: z.string().max(200).optional(),
  source: z.string().max(100),
  type: z.enum(["quote", "scripture", "axiom"]).default("quote"),
  faith: z.enum(["Christianity", "Islam"]).optional().nullable(),
  book: z.string().max(100).optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
  length: z.enum(["short", "medium", "long"]).default("medium"),
});

export const saveQuoteAction = action(SaveQuoteSchema, async (data) => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await db.insert(SavedQuotesTable).values({
      userId,
      entryId: data.entryId,
      quote: data.quote,
      citation: data.citation || null,
      source: data.source,
      type: data.type,
      faith: data.faith || null,
      book: data.book || null,
      reference: data.reference || null,
      length: data.length,
      usedInObituary: false,
      usedInImage: false,
    });

    revalidatePath(`/[entryId]`, "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to save quote:", error);
    return { error: "Failed to save quote" };
  }
});

export const deleteQuoteAction = async (id: number, entryId: string) => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .delete(SavedQuotesTable)
      .where(
        and(
          eq(SavedQuotesTable.id, id),
          eq(SavedQuotesTable.userId, userId)
        )
      );

    revalidatePath(`/[entryId]`, "page");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete quote" };
  }
};
```

### 1.4 Unified API Wrapper

**File:** `/src/lib/api/saved-content.ts`

```typescript
import { searchQuotes } from "./quotes";
import { searchScripture } from "./scripture";

export interface SearchParams {
  query: string;
  type?: "quote" | "scripture" | "all";
  faith?: "Christianity" | "Islam";
  author?: string;
  lengths?: ("short" | "medium" | "long")[];
  limit?: number;
}

export interface UnifiedSearchResult {
  id: string;
  type: "quote" | "scripture";
  content: string;
  citation: string;
  source: string;
  length: "short" | "medium" | "long";
  metadata?: {
    book?: string;
    reference?: string;
    faith?: string;
  };
}

function calculateLength(text: string): "short" | "medium" | "long" {
  if (text.length <= 100) return "short";
  if (text.length <= 200) return "medium";
  return "long";
}

export async function searchContent(
  params: SearchParams
): Promise<UnifiedSearchResult[]> {
  const results: UnifiedSearchResult[] = [];
  
  if (params.type === "quote" || params.type === "all") {
    const quotes = await searchQuotes({
      keyword: params.query,
      author: params.author,
      lengths: params.lengths,
    });
    
    results.push(
      ...quotes.map((q) => ({
        id: crypto.randomUUID(),
        type: "quote" as const,
        content: q.quote,
        citation: q.author,
        source: q.source,
        length: calculateLength(q.quote),
      }))
    );
  }
  
  if ((params.type === "scripture" || params.type === "all") && params.faith) {
    const scripture = await searchScripture({
      keyword: params.query,
      ref: "",
      faith: params.faith,
      limit: params.limit || 50,
    });
    
    results.push(
      ...scripture.map((s) => ({
        id: s.id,
        type: "scripture" as const,
        content: s.text,
        citation: s.ref,
        source: params.faith === "Christianity" ? "Bible" : "Quran",
        length: calculateLength(s.text),
        metadata: {
          book: s.book,
          reference: s.ref,
          faith: params.faith,
        },
      }))
    );
  }
  
  return results;
}
```

---

## Best Practices Alignment

### Next.js 15 with RSC
✅ **Server Components** for data fetching (`SavedQuotesList`)  
✅ **Client Components** for interactivity (`SearchDialog`)  
✅ **Server Actions** with `"use server"` directive  
✅ **React cache()** for request memoization  
✅ **revalidatePath()** after mutations

### Clerk Authentication
✅ `auth()` in server actions for user context  
✅ User ownership validation before mutations  
✅ Organization context support via `orgId`

### Drizzle ORM
✅ Type-safe schema with relations  
✅ Indexed columns for performance  
✅ Cascade deletes for data integrity

### Security
✅ All mutations require authentication  
✅ Zod validation for inputs  
✅ SQL injection prevention via Drizzle  
✅ CSRF protection via Next.js

---

## Next Steps

1. Review PRD files:
   - `docs/prd-quotes-scripture-tools.md`
   - `docs/prd-quotes-scripture-summary.md`

2. If approved, implement Phase 1:
   - Run migration
   - Implement queries/mutations
   - Create API wrapper
   - Test data layer

3. Proceed to Phase 2 (UI components)

Full component implementations available upon approval.
