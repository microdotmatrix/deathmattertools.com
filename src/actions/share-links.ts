"use server";

import {
  shareLinksByDocumentTag,
  shareLinksByEntryTag,
  shareLinksByImageTag,
  shareLinkTag,
} from "@/lib/cache";
import {
  createDocumentShareLink,
  createImageShareLink,
  deleteShareLink,
  updateShareLink,
} from "@/lib/db/mutations";
import {
  getDocumentWithAccess,
  getShareLinkById,
  getShareLinksByDocumentId,
  getShareLinksByImageId,
} from "@/lib/db/queries";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { env } from "@/lib/env/server";

// ============================================================================
// Types
// ============================================================================

type ShareLinkState = {
  success?: boolean;
  error?: string;
  shareLink?: {
    id: string;
    token: string;
    url: string;
  };
};

type ShareLinksListState = {
  success?: boolean;
  error?: string;
  shareLinks?: Array<{
    id: string;
    token: string;
    url: string;
    isEnabled: boolean;
    allowComments: boolean;
    expiresAt: Date | null;
    viewCount: number;
    createdAt: Date;
  }>;
};

type DeleteShareLinkState = {
  success?: boolean;
  error?: string;
};

type UpdateShareLinkState = {
  success?: boolean;
  error?: string;
};

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateShareLinkSchema = z.object({
  allowComments: z.boolean().default(false),
  expiresInDays: z.coerce.number().int().min(0).max(365).nullable().optional(),
});

const UpdateShareLinkSchema = z.object({
  isEnabled: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  expiresInDays: z.coerce.number().int().min(0).max(365).nullable().optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

function buildShareUrl(type: "document" | "image", token: string): string {
  const prefix = type === "document" ? "d" : "i";
  return `${env.BASE_URL}/share/${prefix}/${token}`;
}

function calculateExpiresAt(expiresInDays: number | null | undefined): Date | null {
  if (!expiresInDays || expiresInDays <= 0) return null;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  return expiresAt;
}

// ============================================================================
// Document Share Link Actions
// ============================================================================

/**
 * Create a share link for a document.
 * Only the document owner can create share links.
 */
export async function createDocumentShareLinkAction(
  documentId: string,
  _prevState: ShareLinkState,
  formData: FormData
): Promise<ShareLinkState> {
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

    // Only document owner can create share links
    if (access.role !== "owner") {
      return { error: "Only the document owner can create share links" };
    }

    const allowComments = formData.get("allowComments") === "true";
    const expiresInDaysRaw = formData.get("expiresInDays");
    const expiresInDays = expiresInDaysRaw
      ? Number.parseInt(expiresInDaysRaw as string, 10)
      : null;

    const parsed = CreateShareLinkSchema.safeParse({
      allowComments,
      expiresInDays,
    });

    if (!parsed.success) {
      return { error: "Invalid input" };
    }

    const shareLink = await createDocumentShareLink({
      documentId: access.document.id,
      documentCreatedAt: access.document.createdAt,
      entryId: access.document.entryId,
      createdBy: userId,
      allowComments: parsed.data.allowComments,
      expiresAt: calculateExpiresAt(parsed.data.expiresInDays),
    });

    // Revalidate caches
    revalidateTag(shareLinksByDocumentTag(documentId), "max");
    revalidateTag(shareLinksByEntryTag(access.document.entryId), "max");

    return {
      success: true,
      shareLink: {
        id: shareLink.id,
        token: shareLink.token,
        url: buildShareUrl("document", shareLink.token),
      },
    };
  } catch (error) {
    console.error("Error creating document share link:", error);
    return { error: "Failed to create share link" };
  }
}

/**
 * Get all share links for a document.
 */
export async function getDocumentShareLinksAction(
  documentId: string
): Promise<ShareLinksListState> {
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

    // Only document owner can view share links
    if (access.role !== "owner") {
      return { error: "Only the document owner can view share links" };
    }

    const links = await getShareLinksByDocumentId(documentId);

    return {
      success: true,
      shareLinks: links.map((link) => ({
        id: link.id,
        token: link.token,
        url: buildShareUrl("document", link.token),
        isEnabled: link.isEnabled,
        allowComments: link.allowComments,
        expiresAt: link.expiresAt,
        viewCount: link.viewCount,
        createdAt: link.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error getting document share links:", error);
    return { error: "Failed to get share links" };
  }
}

// ============================================================================
// Image Share Link Actions
// ============================================================================

/**
 * Create a share link for an image.
 * Only the entry owner can create share links for images.
 */
export async function createImageShareLinkAction(
  imageId: string,
  entryId: string,
  _prevState: ShareLinkState,
  formData: FormData
): Promise<ShareLinkState> {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Check entry access
    const entryAccess = await getEntryWithAccess(entryId);

    if (!entryAccess) {
      return { error: "Entry not found" };
    }

    // Only entry owner can create share links
    if (entryAccess.role !== "owner") {
      return { error: "Only the entry owner can create share links" };
    }

    const allowComments = formData.get("allowComments") === "true";
    const expiresInDaysRaw = formData.get("expiresInDays");
    const expiresInDays = expiresInDaysRaw
      ? Number.parseInt(expiresInDaysRaw as string, 10)
      : null;

    const parsed = CreateShareLinkSchema.safeParse({
      allowComments,
      expiresInDays,
    });

    if (!parsed.success) {
      return { error: "Invalid input" };
    }

    const shareLink = await createImageShareLink({
      imageId,
      entryId,
      createdBy: userId,
      allowComments: parsed.data.allowComments,
      expiresAt: calculateExpiresAt(parsed.data.expiresInDays),
    });

    // Revalidate caches
    revalidateTag(shareLinksByImageTag(imageId), "max");
    revalidateTag(shareLinksByEntryTag(entryId), "max");

    return {
      success: true,
      shareLink: {
        id: shareLink.id,
        token: shareLink.token,
        url: buildShareUrl("image", shareLink.token),
      },
    };
  } catch (error) {
    console.error("Error creating image share link:", error);
    return { error: "Failed to create share link" };
  }
}

/**
 * Get all share links for an image.
 */
export async function getImageShareLinksAction(
  imageId: string,
  entryId: string
): Promise<ShareLinksListState> {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Check entry access
    const entryAccess = await getEntryWithAccess(entryId);

    if (!entryAccess) {
      return { error: "Entry not found" };
    }

    // Only entry owner can view share links
    if (entryAccess.role !== "owner") {
      return { error: "Only the entry owner can view share links" };
    }

    const links = await getShareLinksByImageId(imageId);

    return {
      success: true,
      shareLinks: links.map((link) => ({
        id: link.id,
        token: link.token,
        url: buildShareUrl("image", link.token),
        isEnabled: link.isEnabled,
        allowComments: link.allowComments,
        expiresAt: link.expiresAt,
        viewCount: link.viewCount,
        createdAt: link.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error getting image share links:", error);
    return { error: "Failed to get share links" };
  }
}

// ============================================================================
// Common Share Link Actions
// ============================================================================

/**
 * Update a share link's settings.
 */
export async function updateShareLinkAction(
  shareLinkId: string,
  _prevState: UpdateShareLinkState,
  formData: FormData
): Promise<UpdateShareLinkState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const shareLink = await getShareLinkById(shareLinkId);

    if (!shareLink) {
      return { error: "Share link not found" };
    }

    // Only creator can update
    if (shareLink.createdBy !== userId) {
      return { error: "Only the creator can update this share link" };
    }

    const isEnabled = formData.get("isEnabled");
    const allowComments = formData.get("allowComments");
    const expiresInDaysRaw = formData.get("expiresInDays");

    const parsed = UpdateShareLinkSchema.safeParse({
      isEnabled: isEnabled !== null ? isEnabled === "true" : undefined,
      allowComments: allowComments !== null ? allowComments === "true" : undefined,
      expiresInDays: expiresInDaysRaw
        ? Number.parseInt(expiresInDaysRaw as string, 10)
        : undefined,
    });

    if (!parsed.success) {
      return { error: "Invalid input" };
    }

    await updateShareLink({
      id: shareLinkId,
      isEnabled: parsed.data.isEnabled,
      allowComments: parsed.data.allowComments,
      expiresAt:
        parsed.data.expiresInDays !== undefined
          ? calculateExpiresAt(parsed.data.expiresInDays)
          : undefined,
    });

    // Revalidate caches
    revalidateTag(shareLinkTag(shareLink.token), "max");
    if (shareLink.documentId) {
      revalidateTag(shareLinksByDocumentTag(shareLink.documentId), "max");
    }
    if (shareLink.imageId) {
      revalidateTag(shareLinksByImageTag(shareLink.imageId), "max");
    }
    revalidateTag(shareLinksByEntryTag(shareLink.entryId), "max");

    return { success: true };
  } catch (error) {
    console.error("Error updating share link:", error);
    return { error: "Failed to update share link" };
  }
}

/**
 * Delete a share link.
 */
export async function deleteShareLinkAction(
  shareLinkId: string
): Promise<DeleteShareLinkState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const shareLink = await getShareLinkById(shareLinkId);

    if (!shareLink) {
      return { error: "Share link not found" };
    }

    // Only creator can delete
    if (shareLink.createdBy !== userId) {
      return { error: "Only the creator can delete this share link" };
    }

    await deleteShareLink(shareLinkId);

    // Revalidate caches
    revalidateTag(shareLinkTag(shareLink.token), "max");
    if (shareLink.documentId) {
      revalidateTag(shareLinksByDocumentTag(shareLink.documentId), "max");
    }
    if (shareLink.imageId) {
      revalidateTag(shareLinksByImageTag(shareLink.imageId), "max");
    }
    revalidateTag(shareLinksByEntryTag(shareLink.entryId), "max");

    return { success: true };
  } catch (error) {
    console.error("Error deleting share link:", error);
    return { error: "Failed to delete share link" };
  }
}
