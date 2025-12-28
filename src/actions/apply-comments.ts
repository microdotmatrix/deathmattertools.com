"use server";

import { documentCommentsTag } from "@/lib/cache";
import { bulkResolveComments } from "@/lib/db/mutations/comments";
import { getDocumentWithAccess } from "@/lib/db/queries";
import {
  getApprovedCommentCount,
  getApprovedCommentsForAI,
} from "@/lib/db/queries/comments-for-ai";
import { generateCommentsSummary } from "@/lib/ai/comment-formatter";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

type ApplyCommentsPreviewState = {
  success?: boolean;
  error?: string;
  preview?: {
    commentCount: number;
    summary: string;
    commentIds: string[];
  };
};

/**
 * Get a preview of approved comments that can be applied by AI.
 * Returns summary and comment IDs for the bulk action.
 */
export async function getApplyCommentsPreviewAction(
  documentId: string
): Promise<ApplyCommentsPreviewState> {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const access = await getDocumentWithAccess({
      documentId,
      userId,
      orgId,
    });

    if (!access) {
      return { error: "Document not found" };
    }

    // Only document owner can apply comments with AI
    if (access.role !== "owner") {
      return { error: "Only the document owner can apply comments with AI" };
    }

    const approvedComments = await getApprovedCommentsForAI({
      documentId: access.document.id,
      documentCreatedAt: access.document.createdAt,
    });

    if (approvedComments.length === 0) {
      return {
        success: true,
        preview: {
          commentCount: 0,
          summary: "No approved comments to apply.",
          commentIds: [],
        },
      };
    }

    const summary = generateCommentsSummary(approvedComments);
    const commentIds = approvedComments.map((c) => c.id);

    return {
      success: true,
      preview: {
        commentCount: approvedComments.length,
        summary,
        commentIds,
      },
    };
  } catch (error) {
    console.error("Error getting apply comments preview:", error);
    return { error: "Failed to get comments preview" };
  }
}

type ResolveCommentsState = {
  success?: boolean;
  error?: string;
  resolvedCount?: number;
};

/**
 * Bulk resolve comments after AI has applied them.
 * This should be called after the AI successfully updates the document.
 */
export async function resolveAppliedCommentsAction(
  documentId: string,
  commentIds: string[]
): Promise<ResolveCommentsState> {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const access = await getDocumentWithAccess({
      documentId,
      userId,
      orgId,
    });

    if (!access) {
      return { error: "Document not found" };
    }

    // Only document owner can resolve comments
    if (access.role !== "owner") {
      return { error: "Only the document owner can resolve comments" };
    }

    if (commentIds.length === 0) {
      return { success: true, resolvedCount: 0 };
    }

    const result = await bulkResolveComments({
      commentIds,
      documentId: access.document.id,
      documentCreatedAt: access.document.createdAt,
      statusChangedBy: userId,
    });

    // Revalidate cache
    revalidateTag(documentCommentsTag(access.document.id), "max");
    revalidatePath(
      `/${access.document.entryId}/obituaries/${access.document.id}`
    );

    return {
      success: true,
      resolvedCount: result.resolvedCount,
    };
  } catch (error) {
    console.error("Error resolving applied comments:", error);
    return { error: "Failed to resolve comments" };
  }
}
