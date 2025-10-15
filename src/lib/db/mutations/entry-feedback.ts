import "server-only";

import { db } from "@/lib/db";
import { EntryFeedbackTable, type EntryFeedback } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Create a new feedback item
 * Note: Access control is handled in the server action
 */
export const createFeedback = async (data: {
  entryId: string;
  userId: string;
  content: string;
}): Promise<EntryFeedback> => {
  const [feedback] = await db
    .insert(EntryFeedbackTable)
    .values({
      entryId: data.entryId,
      userId: data.userId,
      content: data.content,
      status: "pending",
    })
    .returning();

  return feedback;
};

/**
 * Update feedback content
 * Note: Only pending feedback can be edited
 */
export const updateFeedbackContent = async (data: {
  feedbackId: string;
  userId: string;
  content: string;
}): Promise<EntryFeedback | null> => {
  const [feedback] = await db
    .update(EntryFeedbackTable)
    .set({
      content: data.content,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(EntryFeedbackTable.id, data.feedbackId),
        eq(EntryFeedbackTable.userId, data.userId),
        eq(EntryFeedbackTable.status, "pending")
      )
    )
    .returning();

  return feedback || null;
};

/**
 * Update feedback status
 * Note: Only entry creator can change status
 */
export const updateFeedbackStatus = async (data: {
  feedbackId: string;
  status: "approved" | "denied" | "resolved";
  statusChangedBy: string;
}): Promise<EntryFeedback | null> => {
  const [feedback] = await db
    .update(EntryFeedbackTable)
    .set({
      status: data.status,
      statusChangedAt: new Date(),
      statusChangedBy: data.statusChangedBy,
      updatedAt: new Date(),
    })
    .where(eq(EntryFeedbackTable.id, data.feedbackId))
    .returning();

  return feedback || null;
};

/**
 * Delete feedback
 * Note: Only pending feedback by the author can be deleted
 */
export const deleteFeedback = async (data: {
  feedbackId: string;
  userId: string;
}): Promise<boolean> => {
  const result = await db
    .delete(EntryFeedbackTable)
    .where(
      and(
        eq(EntryFeedbackTable.id, data.feedbackId),
        eq(EntryFeedbackTable.userId, data.userId),
        eq(EntryFeedbackTable.status, "pending")
      )
    )
    .returning();

  return result.length > 0;
};
