import { db } from "@/lib/db";
import {
    NewSystemFeedback,
    SystemFeedback,
    SystemFeedbackTable,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Create a new feedback entry
 * This is the main ingestion point for all user-facing feedback forms
 */
export const createSystemFeedback = async (
  data: NewSystemFeedback
): Promise<SystemFeedback> => {
  const [feedback] = await db
    .insert(SystemFeedbackTable)
    .values({
      ...data,
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return feedback;
};

/**
 * Update feedback status
 * Used by system admins to triage feedback
 */
export const updateFeedbackStatus = async (data: {
  feedbackId: string;
  status: "new" | "in_review" | "resolved" | "dismissed";
}): Promise<SystemFeedback | null> => {
  const [feedback] = await db
    .update(SystemFeedbackTable)
    .set({
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(SystemFeedbackTable.id, data.feedbackId))
    .returning();

  return feedback || null;
};

/**
 * Update feedback priority
 * Used by system admins to prioritize feedback
 */
export const updateFeedbackPriority = async (data: {
  feedbackId: string;
  priority: "low" | "medium" | "high" | null;
}): Promise<SystemFeedback | null> => {
  const [feedback] = await db
    .update(SystemFeedbackTable)
    .set({
      priority: data.priority,
      updatedAt: new Date(),
    })
    .where(eq(SystemFeedbackTable.id, data.feedbackId))
    .returning();

  return feedback || null;
};

/**
 * Update internal notes
 * Used by system admins to add context and notes
 */
export const updateFeedbackNotes = async (data: {
  feedbackId: string;
  internalNotes: string;
}): Promise<SystemFeedback | null> => {
  const [feedback] = await db
    .update(SystemFeedbackTable)
    .set({
      internalNotes: data.internalNotes,
      updatedAt: new Date(),
    })
    .where(eq(SystemFeedbackTable.id, data.feedbackId))
    .returning();

  return feedback || null;
};

/**
 * Update both status and notes in a single transaction
 * Most common admin action
 */
export const updateFeedbackStatusAndNotes = async (data: {
  feedbackId: string;
  status: "new" | "in_review" | "resolved" | "dismissed";
  internalNotes?: string;
}): Promise<SystemFeedback | null> => {
  const [feedback] = await db
    .update(SystemFeedbackTable)
    .set({
      status: data.status,
      internalNotes: data.internalNotes,
      updatedAt: new Date(),
    })
    .where(eq(SystemFeedbackTable.id, data.feedbackId))
    .returning();

  return feedback || null;
};

/**
 * Delete feedback (soft delete by status, or hard delete)
 * Generally not recommended; prefer dismissing instead
 */
export const deleteFeedback = async (
  feedbackId: string
): Promise<boolean> => {
  try {
    await db
      .delete(SystemFeedbackTable)
      .where(eq(SystemFeedbackTable.id, feedbackId));
    return true;
  } catch (error) {
    console.error("Failed to delete feedback:", error);
    return false;
  }
};
