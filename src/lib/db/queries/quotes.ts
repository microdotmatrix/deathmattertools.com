import "server-only";
import { db } from "@/lib/db";
import { SavedQuotesTable } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { cache } from "react";

/**
 * Get all saved quotes for a specific entry
 */
export const getSavedQuotesByEntryId = cache(async (entryId: string) => {
  return await db
    .select()
    .from(SavedQuotesTable)
    .where(eq(SavedQuotesTable.entryId, entryId))
    .orderBy(desc(SavedQuotesTable.createdAt));
});

/**
 * Get all saved quotes for a specific user
 */
export const getUserSavedQuotes = cache(async (userId: string) => {
  return await db
    .select()
    .from(SavedQuotesTable)
    .where(eq(SavedQuotesTable.userId, userId))
    .orderBy(desc(SavedQuotesTable.createdAt));
});

/**
 * Check if a quote is already saved for an entry by a user
 */
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

/**
 * Get saved quotes filtered by type (quote or scripture)
 */
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