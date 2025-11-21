"use server";

import {
    createSystemFeedback,
    deleteFeedback,
    updateFeedbackNotes,
    updateFeedbackPriority,
    updateFeedbackStatus,
    updateFeedbackStatusAndNotes,
} from "@/lib/db/mutations/system-feedback";
import type { NewSystemFeedback } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

/**
 * Submit new feedback from user-facing forms
 * This is the main ingestion endpoint for all feedback types
 */
export async function submitFeedbackAction(data: {
  type: "contact" | "feature_request" | "bug" | "other";
  source: string;
  userId?: string;
  entryId?: string;
  subject: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const feedbackData: NewSystemFeedback = {
      ...data,
      status: "new",
      priority: null,
      internalNotes: null,
    };

    const feedback = await createSystemFeedback(feedbackData);

    // Optionally trigger email notifications to admins here
    // await sendAdminNotification(feedback);

    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}

/**
 * Update feedback status (admin only)
 */
export async function updateFeedbackStatusAction(data: {
  feedbackId: string;
  status: "new" | "in_review" | "resolved" | "dismissed";
}) {
  try {
    const feedback = await updateFeedbackStatus(data);

    if (!feedback) {
      return { success: false, error: "Feedback not found" };
    }

    revalidatePath("/dashboard/feedback");
    return { success: true, feedback };
  } catch (error) {
    console.error("Failed to update feedback status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

/**
 * Update feedback priority (admin only)
 */
export async function updateFeedbackPriorityAction(data: {
  feedbackId: string;
  priority: "low" | "medium" | "high" | null;
}) {
  try {
    const feedback = await updateFeedbackPriority(data);

    if (!feedback) {
      return { success: false, error: "Feedback not found" };
    }

    revalidatePath("/dashboard/feedback");
    return { success: true, feedback };
  } catch (error) {
    console.error("Failed to update feedback priority:", error);
    return { success: false, error: "Failed to update priority" };
  }
}

/**
 * Update internal notes (admin only)
 */
export async function updateFeedbackNotesAction(data: {
  feedbackId: string;
  internalNotes: string;
}) {
  try {
    const feedback = await updateFeedbackNotes(data);

    if (!feedback) {
      return { success: false, error: "Feedback not found" };
    }

    revalidatePath("/dashboard/feedback");
    return { success: true, feedback };
  } catch (error) {
    console.error("Failed to update feedback notes:", error);
    return { success: false, error: "Failed to update notes" };
  }
}

/**
 * Update both status and notes in one action (admin only)
 * This is the most common admin workflow
 */
export async function updateFeedbackStatusAndNotesAction(data: {
  feedbackId: string;
  status: "new" | "in_review" | "resolved" | "dismissed";
  internalNotes?: string;
}) {
  try {
    const feedback = await updateFeedbackStatusAndNotes(data);

    if (!feedback) {
      return { success: false, error: "Feedback not found" };
    }

    revalidatePath("/dashboard/feedback");
    return { success: true, feedback };
  } catch (error) {
    console.error("Failed to update feedback:", error);
    return { success: false, error: "Failed to update feedback" };
  }
}

/**
 * Delete feedback (admin only)
 * Generally not recommended; prefer dismissing instead
 */
export async function deleteFeedbackAction(feedbackId: string) {
  try {
    const success = await deleteFeedback(feedbackId);

    if (!success) {
      return { success: false, error: "Failed to delete feedback" };
    }

    revalidatePath("/dashboard/feedback");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete feedback:", error);
    return { success: false, error: "Failed to delete feedback" };
  }
}
