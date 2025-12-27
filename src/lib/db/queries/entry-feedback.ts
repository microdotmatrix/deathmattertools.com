import "server-only";

import { entryFeedbackTag } from "@/lib/cache";
import { db } from "@/lib/db";
import {
    EntryFeedbackTable,
    type EntryFeedback,
    type EntryFeedbackWithDetails,
    type EntryFeedbackWithUser,
} from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getEntryWithAccess } from "./entries";

const isAbortError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as { name?: unknown; message?: unknown; cause?: unknown };
  if (err.name === "AbortError") {
    return true;
  }

  if (typeof err.message === "string" && err.message.includes("AbortError")) {
    return true;
  }

  if (err.cause && typeof err.cause === "object") {
    const cause = err.cause as { name?: unknown; code?: unknown; message?: unknown };
    if (cause.name === "AbortError") {
      return true;
    }

    if (typeof cause.code === "number" && cause.code === 20) {
      return true;
    }

    if (typeof cause.message === "string" && cause.message.includes("AbortError")) {
      return true;
    }
  }

  return false;
};

/**
 * Get all feedback for an entry with user information
 * Requires user to have view access to the entry
 */
export async function getEntryFeedback(
  entryId: string
): Promise<EntryFeedbackWithUser[] | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Verify user has access to the entry
  const access = await getEntryWithAccess(entryId);
  if (!access || !access.canView) {
    return null;
  }

  return getCachedEntryFeedback(entryId);
}

/**
 * Cached feedback lookup - separated from auth check for proper caching
 */
async function getCachedEntryFeedback(
  entryId: string
): Promise<EntryFeedbackWithUser[]> {
  "use cache";
  cacheLife("realtime");
  cacheTag(entryFeedbackTag(entryId));

  try {
    const feedback = await db.query.EntryFeedbackTable.findMany({
      where: eq(EntryFeedbackTable.entryId, entryId),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [desc(EntryFeedbackTable.createdAt)],
    });

    return feedback as EntryFeedbackWithUser[];
  } catch (error) {
    console.error("Failed to get entry feedback:", error);
    return [];
  }
}

/**
 * Get feedback filtered by status
 */
export async function getFeedbackByStatus(
  entryId: string,
  status: EntryFeedback["status"]
): Promise<EntryFeedbackWithUser[]> {
  const feedback = await getEntryFeedback(entryId);
  if (!feedback) return [];

  return feedback.filter((f) => f.status === status);
}

/**
 * Get a single feedback item by ID
 * Requires user to have view access to the entry
 * Note: This query is not cached as it's primarily used in mutations
 * for ownership verification where fresh data is essential
 */
export async function getFeedbackById(
  feedbackId: string
): Promise<EntryFeedbackWithDetails | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const feedback = await db.query.EntryFeedbackTable.findFirst({
      where: eq(EntryFeedbackTable.id, feedbackId),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
            imageUrl: true,
          },
        },
        entry: true,
      },
    });

    if (!feedback) {
      return null;
    }

    // Verify user has access to the entry
    const access = await getEntryWithAccess(feedback.entry.id);
    if (!access || !access.canView) {
      return null;
    }

    return feedback as EntryFeedbackWithDetails;
  } catch (error) {
    console.error("Failed to get feedback by ID:", error);
    return null;
  }
}

/**
 * Get feedback count by status for an entry
 */
export async function getFeedbackCounts(
  entryId: string
): Promise<Record<EntryFeedback["status"], number> | null> {
  const feedback = await getEntryFeedback(entryId);
  if (!feedback) return null;

  return {
    pending: feedback.filter((f) => f.status === "pending").length,
    approved: feedback.filter((f) => f.status === "approved").length,
    denied: feedback.filter((f) => f.status === "denied").length,
    resolved: feedback.filter((f) => f.status === "resolved").length,
  };
}

/**
 * Get pending feedback counts for multiple entries
 */
export async function getPendingFeedbackCounts(
  entryIds: string[]
): Promise<Record<string, number>> {
  const { userId } = await auth();

  if (!userId || entryIds.length === 0) {
    return {};
  }

  try {
    const rows = await db
      .select({
        entryId: EntryFeedbackTable.entryId,
        count: sql<number>`count(*)`,
      })
      .from(EntryFeedbackTable)
      .where(
        and(
          inArray(EntryFeedbackTable.entryId, entryIds),
          eq(EntryFeedbackTable.status, "pending")
        )
      )
      .groupBy(EntryFeedbackTable.entryId);

    return Object.fromEntries(
      rows.map((row) => [row.entryId, Number(row.count)])
    );
  } catch (error) {
    if (isAbortError(error)) {
      return {};
    }

    console.error("Failed to get pending feedback counts:", error);
    return {};
  }
}

/**
 * Check if user can manage feedback (is entry creator)
 */
export async function canManageFeedback(entryId: string): Promise<boolean> {
  const access = await getEntryWithAccess(entryId);
  return access?.canEdit ?? false;
}
