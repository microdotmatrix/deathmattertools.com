"use server";

import { entryDetailTag, entryFeedbackTag } from "@/lib/cache";
import {
  createFeedback,
  deleteFeedback,
  updateFeedbackContent,
  updateFeedbackStatus,
} from "@/lib/db/mutations/entry-feedback";
import { isValidEntryFeedbackTarget } from "@/lib/entry-feedback/targets";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import { getFeedbackById } from "@/lib/db/queries/entry-feedback";
import { auth } from "@clerk/nextjs/server";
import { updateTag } from "next/cache";
import { z } from "zod";

// Validation schemas
const CreateFeedbackSchema = z.object({
  content: z.string().min(1, "Feedback cannot be empty").max(2000, "Feedback is too long"),
  targetKey: z
    .string()
    .optional()
    .nullable()
    .refine((value) => !value || isValidEntryFeedbackTarget(value), {
      message: "Invalid target",
    }),
});

const UpdateFeedbackSchema = z.object({
  content: z.string().min(1, "Feedback cannot be empty").max(2000, "Feedback is too long"),
  targetKey: z
    .string()
    .optional()
    .nullable()
    .refine((value) => !value || isValidEntryFeedbackTarget(value), {
      message: "Invalid target",
    }),
});

const UpdateStatusSchema = z.object({
  status: z.enum(["approved", "denied", "resolved"]),
});

// State types
type FeedbackState = {
  success?: boolean;
  error?: string;
  feedback?: any;
};

const normalizeTargetKey = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Create new feedback on an entry
 * Requires: User has view access to entry (owner or org member)
 */
export async function createFeedbackAction(
  entryId: string,
  _prevState: FeedbackState,
  formData: FormData
): Promise<FeedbackState> {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Verify user has access to the entry
    const access = await getEntryWithAccess(entryId);
    if (!access || !access.canView) {
      return { error: "You do not have permission to provide feedback on this entry" };
    }

    // Validate input
    const content = formData.get("content") as string;
    const targetKey = normalizeTargetKey(formData.get("targetKey"));
    const parsed = CreateFeedbackSchema.safeParse({ content, targetKey });

    if (!parsed.success) {
      return {
        error:
          parsed.error.flatten().fieldErrors.content?.[0] ||
          parsed.error.flatten().fieldErrors.targetKey?.[0] ||
          "Invalid input",
      };
    }

    // Create feedback
    const feedback = await createFeedback({
      entryId,
      userId,
      content: parsed.data.content,
      targetKey: parsed.data.targetKey ?? null,
    });

    // Immediately invalidate feedback cache for read-your-own-writes
    updateTag(entryFeedbackTag(entryId));
    updateTag(entryDetailTag(entryId));

    return { success: true, feedback };
  } catch (error) {
    console.error("Error creating feedback:", error);
    return { error: "Failed to create feedback" };
  }
}

/**
 * Update feedback content
 * Requires: User is feedback author AND feedback is pending
 */
export async function updateFeedbackAction(
  feedbackId: string,
  _prevState: FeedbackState,
  formData: FormData
): Promise<FeedbackState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Get feedback and verify ownership
    const existingFeedback = await getFeedbackById(feedbackId);
    if (!existingFeedback) {
      return { error: "Feedback not found" };
    }

    if (existingFeedback.userId !== userId) {
      return { error: "You can only edit your own feedback" };
    }

    if (existingFeedback.status !== "pending") {
      return { error: "Only pending feedback can be edited" };
    }

    // Validate input
    const content = formData.get("content") as string;
    const targetKey = normalizeTargetKey(formData.get("targetKey"));
    const parsed = UpdateFeedbackSchema.safeParse({ content, targetKey });

    if (!parsed.success) {
      return {
        error:
          parsed.error.flatten().fieldErrors.content?.[0] ||
          parsed.error.flatten().fieldErrors.targetKey?.[0] ||
          "Invalid input",
      };
    }

    // Update feedback
    const feedback = await updateFeedbackContent({
      feedbackId,
      userId,
      content: parsed.data.content,
      targetKey: parsed.data.targetKey ?? null,
    });

    if (!feedback) {
      return { error: "Failed to update feedback" };
    }

    // Immediately invalidate feedback cache for read-your-own-writes
    updateTag(entryFeedbackTag(existingFeedback.entry.id));
    updateTag(entryDetailTag(existingFeedback.entry.id));

    return { success: true, feedback };
  } catch (error) {
    console.error("Error updating feedback:", error);
    return { error: "Failed to update feedback" };
  }
}

/**
 * Delete feedback
 * Requires: User is feedback author AND feedback is pending
 */
export async function deleteFeedbackAction(
  feedbackId: string
): Promise<FeedbackState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Get feedback and verify ownership
    const existingFeedback = await getFeedbackById(feedbackId);
    if (!existingFeedback) {
      return { error: "Feedback not found" };
    }

    if (existingFeedback.userId !== userId) {
      return { error: "You can only delete your own feedback" };
    }

    if (existingFeedback.status !== "pending") {
      return { error: "Only pending feedback can be deleted" };
    }

    // Delete feedback
    const deleted = await deleteFeedback({
      feedbackId,
      userId,
    });

    if (!deleted) {
      return { error: "Failed to delete feedback" };
    }

    // Immediately invalidate feedback cache for read-your-own-writes
    updateTag(entryFeedbackTag(existingFeedback.entry.id));
    updateTag(entryDetailTag(existingFeedback.entry.id));

    return { success: true };
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return { error: "Failed to delete feedback" };
  }
}

/**
 * Update feedback status (approve/deny/resolve)
 * Requires: User is entry creator
 */
export async function updateFeedbackStatusAction(
  feedbackId: string,
  status: "approved" | "denied" | "resolved"
): Promise<FeedbackState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Validate status
    const parsed = UpdateStatusSchema.safeParse({ status });
    if (!parsed.success) {
      return { error: "Invalid status" };
    }

    // Get feedback and verify entry ownership
    const existingFeedback = await getFeedbackById(feedbackId);
    if (!existingFeedback) {
      return { error: "Feedback not found" };
    }

    // Verify user is entry creator
    const access = await getEntryWithAccess(existingFeedback.entry.id);
    if (!access || !access.canEdit) {
      return { error: "Only the entry creator can manage feedback" };
    }

    // Validate state transitions
    if (status === "resolved" && existingFeedback.status !== "approved") {
      return { error: "Only approved feedback can be marked as resolved" };
    }

    // Update status
    const feedback = await updateFeedbackStatus({
      feedbackId,
      status: parsed.data.status,
      statusChangedBy: userId,
    });

    if (!feedback) {
      return { error: "Failed to update feedback status" };
    }

    // Immediately invalidate feedback cache for read-your-own-writes
    updateTag(entryFeedbackTag(existingFeedback.entry.id));
    updateTag(entryDetailTag(existingFeedback.entry.id));

    return { success: true, feedback };
  } catch (error) {
    console.error("Error updating feedback status:", error);
    return { error: "Failed to update feedback status" };
  }
}
