"use server";

import { documentCommentsTag } from "@/lib/cache";
import {
    createDocumentComment,
    deleteDocumentComment,
    updateCommentAnchorStatus,
    updateDocumentComment,
    updateDocumentCommentStatus,
} from "@/lib/db/mutations";
import {
    getDocumentCommentById,
    getDocumentWithAccess,
} from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

const CommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  parentId: z.string().nullish(),
  // Optional anchor fields
  anchorStart: z.coerce.number().int().nonnegative().nullish(),
  anchorEnd: z.coerce.number().int().nonnegative().nullish(),
  anchorText: z.string().nullish(),
  anchorPrefix: z.string().nullish(),
  anchorSuffix: z.string().nullish(),
});

const UpdateCommentStatusSchema = z.object({
  status: z.enum(["pending", "approved", "denied", "resolved"]),
});

type CommentState = {
  success?: boolean;
  error?: string;
  comment?: any;
};

export async function createCommentAction(
  documentId: string,
  _prevState: CommentState,
  formData: FormData
): Promise<CommentState> {
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
      return { error: "Forbidden" };
    }

    if (!access.canComment) {
      return { error: "You do not have permission to comment" };
    }

    const content = formData.get("content") as string;
    const parentId = formData.get("parentId") as string | null;
    const anchorStart = formData.get("anchorStart");
    const anchorEnd = formData.get("anchorEnd");
    const anchorText = formData.get("anchorText");
    const anchorPrefix = formData.get("anchorPrefix");
    const anchorSuffix = formData.get("anchorSuffix");

    const parsed = CommentSchema.safeParse({ 
      content, 
      parentId,
      anchorStart,
      anchorEnd,
      anchorText,
      anchorPrefix,
      anchorSuffix,
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors.content?.[0] || "Invalid input" };
    }

    const validParentId = parsed.data.parentId || null;

    if (validParentId) {
      const parent = await getDocumentCommentById(validParentId);
      if (
        !parent ||
        parent.documentId !== access.document.id ||
        parent.documentCreatedAt.getTime() !== access.document.createdAt.getTime()
      ) {
        return { error: "Invalid parent comment" };
      }
    }

    const comment = await createDocumentComment({
      documentId: access.document.id,
      documentCreatedAt: access.document.createdAt,
      userId,
      content: parsed.data.content,
      parentId: validParentId,
      // Add anchor data if provided
      anchorStart: parsed.data.anchorStart ?? null,
      anchorEnd: parsed.data.anchorEnd ?? null,
      anchorText: parsed.data.anchorText ?? null,
      anchorPrefix: parsed.data.anchorPrefix ?? null,
      anchorSuffix: parsed.data.anchorSuffix ?? null,
    });

    // Revalidate both the cache tag and the page path
    revalidateTag(documentCommentsTag(access.document.id), "max");
    revalidatePath(`/${access.document.entryId}/obituaries/${access.document.id}`);

    return { success: true, comment };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { error: "Failed to create comment" };
  }
}

type UpdateCommentState = {
  success?: boolean;
  error?: string;
  comment?: any;
};

export async function updateCommentAction(
  documentId: string,
  commentId: string,
  _prevState: UpdateCommentState,
  formData: FormData
): Promise<UpdateCommentState> {
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
      return { error: "Forbidden" };
    }

    const comment = await getDocumentCommentById(commentId);

    if (
      !comment ||
      comment.documentId !== access.document.id ||
      comment.documentCreatedAt.getTime() !== access.document.createdAt.getTime()
    ) {
      return { error: "Comment not found" };
    }

    const canModerate = access.role === "owner";
    if (comment.userId !== userId && !canModerate) {
      return { error: "Forbidden" };
    }

    if (comment.status !== "pending") {
      return { error: "Only pending comments can be edited" };
    }

    const content = formData.get("content") as string;
    const parsed = z.string().min(1, "Comment cannot be empty").safeParse(content);

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const updated = await updateDocumentComment({
      commentId,
      documentId: access.document.id,
      documentCreatedAt: access.document.createdAt,
      userId: comment.userId,
      content: parsed.data,
    });

    if (!updated) {
      return { error: "Unable to update comment" };
    }

    revalidateTag(documentCommentsTag(access.document.id), "max");
    revalidatePath(`/${access.document.entryId}/obituaries/${access.document.id}`);

    return { success: true, comment: updated };
  } catch (error) {
    console.error("Error updating comment:", error);
    return { error: "Failed to update comment" };
  }
}

type DeleteCommentState = {
  success?: boolean;
  error?: string;
};

export async function deleteCommentAction(
  documentId: string,
  commentId: string
): Promise<DeleteCommentState> {
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
      return { error: "Forbidden" };
    }

    const comment = await getDocumentCommentById(commentId);

    if (
      !comment ||
      comment.documentId !== access.document.id ||
      comment.documentCreatedAt.getTime() !== access.document.createdAt.getTime()
    ) {
      return { error: "Comment not found" };
    }

    const canModerate = access.role === "owner";
    if (comment.userId !== userId && !canModerate) {
      return { error: "Forbidden" };
    }

    if (comment.status !== "pending") {
      return { error: "Only pending comments can be deleted" };
    }

    const deleted = await deleteDocumentComment({
      commentId,
      documentId: access.document.id,
      documentCreatedAt: access.document.createdAt,
      userId: comment.userId,
    });

    if (!deleted) {
      return { error: "Unable to delete comment" };
    }

    revalidateTag(documentCommentsTag(access.document.id), "max");
    revalidatePath(`/${access.document.entryId}/obituaries/${access.document.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { error: "Failed to delete comment" };
  }
}

type AnchorStatusState = {
  success?: boolean;
  error?: string;
};

export async function updateAnchorStatusAction(
  documentId: string,
  commentId: string,
  status: "approved" | "denied"
): Promise<AnchorStatusState> {
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
      return { error: "Forbidden" };
    }

    // Only document owner can moderate
    if (access.role !== "owner") {
      return { error: "Only document owner can moderate comments" };
    }

    const comment = await getDocumentCommentById(commentId);

    if (
      !comment ||
      comment.documentId !== access.document.id ||
      comment.documentCreatedAt.getTime() !== access.document.createdAt.getTime()
    ) {
      return { error: "Comment not found" };
    }

    // Ensure comment has an anchor
    if (!comment.anchorStart || !comment.anchorEnd) {
      return { error: "Only anchored comments can be moderated" };
    }

    const updated = await updateCommentAnchorStatus({
      commentId,
      documentId: access.document.id,
      documentCreatedAt: access.document.createdAt,
      status,
    });

    if (!updated) {
      return { error: "Unable to update anchor status" };
    }

    revalidateTag(documentCommentsTag(access.document.id), "max");
    revalidatePath(`/${access.document.entryId}/obituaries/${access.document.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating anchor status:", error);
    return { error: "Failed to update anchor status" };
  }
}

type CommentStatusState = {
  success?: boolean;
  error?: string;
  comment?: any;
};

export async function updateCommentStatusAction(
  documentId: string,
  commentId: string,
  status: "pending" | "approved" | "denied" | "resolved"
): Promise<CommentStatusState> {
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
      return { error: "Forbidden" };
    }

    if (access.role !== "owner") {
      return { error: "Only document owner can moderate comments" };
    }

    const parsed = UpdateCommentStatusSchema.safeParse({ status });
    if (!parsed.success) {
      return { error: "Invalid status" };
    }

    const comment = await getDocumentCommentById(commentId);

    if (
      !comment ||
      comment.documentId !== access.document.id ||
      comment.documentCreatedAt.getTime() !== access.document.createdAt.getTime()
    ) {
      return { error: "Comment not found" };
    }

    if (status === "resolved" && comment.status !== "approved") {
      return { error: "Only approved comments can be marked as resolved" };
    }

    if (status === "pending" && comment.status !== "denied" && comment.status !== "resolved") {
      return { error: "Only denied or resolved comments can be reopened" };
    }

    const updated = await updateDocumentCommentStatus({
      commentId,
      documentId: access.document.id,
      documentCreatedAt: access.document.createdAt,
      status,
      statusChangedBy: userId,
    });

    if (!updated) {
      return { error: "Unable to update comment status" };
    }

    revalidateTag(documentCommentsTag(access.document.id), "max");
    revalidatePath(`/${access.document.entryId}/obituaries/${access.document.id}`);

    return { success: true, comment: updated };
  } catch (error) {
    console.error("Error updating comment status:", error);
    return { error: "Failed to update comment status" };
  }
}
