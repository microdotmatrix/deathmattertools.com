import { db } from "@/lib/db";
import { PageContentTable, type PageContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";
import "server-only";

/**
 * Cached function to fetch page content by slug
 * Uses React cache() for request-level memoization
 */
export const getPageContentBySlug = cache(async (slug: string): Promise<PageContent | null> => {
  const [pageContent] = await db
    .select()
    .from(PageContentTable)
    .where(eq(PageContentTable.slug, slug))
    .limit(1);

  return pageContent || null;
});

/**
 * Get all page content (admin use)
 */
export async function getAllPageContent(): Promise<PageContent[]> {
  return await db.select().from(PageContentTable);
}
