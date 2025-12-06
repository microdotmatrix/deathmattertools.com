import "server-only";

import {
    savedQuotesByEntryTag,
    savedQuotesByUserTag,
} from "@/lib/cache";
import { db } from "@/lib/db";
import { SavedQuotesTable } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Get all saved quotes for a specific entry - cached
 */
export async function getSavedQuotesByEntryId(entryId: string) {
  "use cache";
  cacheLife("content");
  cacheTag(savedQuotesByEntryTag(entryId));

  return db
    .select()
    .from(SavedQuotesTable)
    .where(eq(SavedQuotesTable.entryId, entryId))
    .orderBy(desc(SavedQuotesTable.createdAt));
}

/**
 * Get all saved quotes for a specific user - cached
 */
export async function getUserSavedQuotes(userId: string) {
  "use cache";
  cacheLife("dashboard");
  cacheTag(savedQuotesByUserTag(userId));

  return db
    .select()
    .from(SavedQuotesTable)
    .where(eq(SavedQuotesTable.userId, userId))
    .orderBy(desc(SavedQuotesTable.createdAt));
}

/**
 * Check if a quote is already saved for an entry by a user
 * Note: Not cached as this is typically used in mutation flows
 * where fresh data is essential
 */
export async function isQuoteSaved(
  userId: string,
  entryId: string,
  quote: string
) {
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

/**
 * Get saved quotes filtered by type (quote or scripture) - cached
 */
export async function getSavedQuotesByType(
  entryId: string,
  type: "quote" | "scripture"
) {
  "use cache";
  cacheLife("content");
  cacheTag(savedQuotesByEntryTag(entryId));

  return db
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