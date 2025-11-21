import "server-only";

import { db } from "@/lib/db";
import {
    SystemFeedbackTable,
    type SystemFeedbackWithUser
} from "@/lib/db/schema";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { cache } from "react";

export interface FeedbackFilters {
  type?: "contact" | "feature_request" | "bug" | "other";
  status?: "new" | "in_review" | "resolved" | "dismissed";
  search?: string;
  limit?: number;
  offset?: number;
}

export interface FeedbackListResult {
  feedback: SystemFeedbackWithUser[];
  total: number;
}

/**
 * Get all system feedback with pagination, filtering, and search
 */
export const getSystemFeedback = cache(
  async (filters: FeedbackFilters = {}): Promise<FeedbackListResult> => {
    const { type, status, search, limit = 50, offset = 0 } = filters;

    try {
      // Build where conditions
      const conditions = [];

      if (type) {
        conditions.push(eq(SystemFeedbackTable.type, type));
      }

      if (status) {
        conditions.push(eq(SystemFeedbackTable.status, status));
      }

      if (search) {
        conditions.push(
          or(
            ilike(SystemFeedbackTable.subject, `%${search}%`),
            ilike(SystemFeedbackTable.message, `%${search}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get feedback with user info
      const feedback = await db.query.SystemFeedbackTable.findMany({
        where: whereClause,
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
        orderBy: [desc(SystemFeedbackTable.createdAt)],
        limit,
        offset,
      });

      // Get total count for pagination
      const [{ value: total }] = await db
        .select({ value: count() })
        .from(SystemFeedbackTable)
        .where(whereClause);

      return {
        feedback: feedback as SystemFeedbackWithUser[],
        total,
      };
    } catch (error) {
      console.error("Failed to get system feedback:", error);
      return { feedback: [], total: 0 };
    }
  }
);

/**
 * Get a single feedback item by ID
 */
export const getFeedbackById = cache(
  async (feedbackId: string): Promise<SystemFeedbackWithUser | null> => {
    try {
      const feedback = await db.query.SystemFeedbackTable.findFirst({
        where: eq(SystemFeedbackTable.id, feedbackId),
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
      });

      return (feedback as SystemFeedbackWithUser) || null;
    } catch (error) {
      console.error("Failed to get feedback by ID:", error);
      return null;
    }
  }
);

/**
 * Get feedback counts by status
 */
export const getFeedbackStatusCounts = cache(async () => {
  try {
    const counts = await db
      .select({
        status: SystemFeedbackTable.status,
        count: count(),
      })
      .from(SystemFeedbackTable)
      .groupBy(SystemFeedbackTable.status);

    return counts.reduce(
      (acc, { status, count: statusCount }) => {
        acc[status] = statusCount;
        return acc;
      },
      {} as Record<string, number>
    );
  } catch (error) {
    console.error("Failed to get feedback status counts:", error);
    return {};
  }
});

/**
 * Get feedback counts by type
 */
export const getFeedbackTypeCounts = cache(async () => {
  try {
    const counts = await db
      .select({
        type: SystemFeedbackTable.type,
        count: count(),
      })
      .from(SystemFeedbackTable)
      .groupBy(SystemFeedbackTable.type);

    return counts.reduce(
      (acc, { type, count: typeCount }) => {
        acc[type] = typeCount;
        return acc;
      },
      {} as Record<string, number>
    );
  } catch (error) {
    console.error("Failed to get feedback type counts:", error);
    return {};
  }
});
