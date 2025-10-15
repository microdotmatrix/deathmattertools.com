import "server-only";

import { db } from "@/lib/db";
import {
  EntryFeedbackTable,
  type EntryFeedback,
  type EntryFeedbackWithUser,
  type EntryFeedbackWithDetails,
} from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { cache } from "react";
import { getEntryWithAccess } from "./entries";

/**
 * Get all feedback for an entry with user information
 * Requires user to have view access to the entry
 */
export const getEntryFeedback = cache(
  async (entryId: string): Promise<EntryFeedbackWithUser[] | null> => {
    const { userId, orgId } = await auth();

    if (!userId) {
      return null;
    }

    // Verify user has access to the entry
    const access = await getEntryWithAccess(entryId);
    if (!access || !access.canView) {
      return null;
    }

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
      return null;
    }
  }
);

/**
 * Get feedback filtered by status
 */
export const getFeedbackByStatus = cache(
  async (
    entryId: string,
    status: EntryFeedback["status"]
  ): Promise<EntryFeedbackWithUser[]> => {
    const feedback = await getEntryFeedback(entryId);
    if (!feedback) return [];

    return feedback.filter((f) => f.status === status);
  }
);

/**
 * Get a single feedback item by ID
 * Requires user to have view access to the entry
 */
export const getFeedbackById = cache(
  async (feedbackId: string): Promise<EntryFeedbackWithDetails | null> => {
    const { userId, orgId } = await auth();

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
);

/**
 * Get feedback count by status for an entry
 */
export const getFeedbackCounts = cache(
  async (
    entryId: string
  ): Promise<Record<EntryFeedback["status"], number> | null> => {
    const feedback = await getEntryFeedback(entryId);
    if (!feedback) return null;

    return {
      pending: feedback.filter((f) => f.status === "pending").length,
      approved: feedback.filter((f) => f.status === "approved").length,
      denied: feedback.filter((f) => f.status === "denied").length,
      resolved: feedback.filter((f) => f.status === "resolved").length,
    };
  }
);

/**
 * Check if user can manage feedback (is entry creator)
 */
export const canManageFeedback = cache(
  async (entryId: string): Promise<boolean> => {
    const access = await getEntryWithAccess(entryId);
    return access?.canEdit ?? false;
  }
);
