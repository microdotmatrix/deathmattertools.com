"use server";

import { documentCommentsTag, shareLinkTag } from "@/lib/cache";
import {
  createGuestToken,
  verifyGuestToken,
  extractGuestToken,
  GUEST_TOKEN_COOKIE,
  getGuestTokenCookieOptions,
  generateTokenFingerprint,
} from "@/lib/auth/guest-token";
import { createDocumentComment } from "@/lib/db/mutations";
import { upsertGuestCommenter } from "@/lib/db/mutations/share-links";
import {
  getShareLinkByToken,
  getSharedDocumentByToken,
  getGuestCommenterById,
} from "@/lib/db/queries";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

type GuestIdentityState = {
  success?: boolean;
  error?: string;
  guest?: {
    id: string;
    name: string;
    email: string;
  };
};

type GuestCommentState = {
  success?: boolean;
  error?: string;
  comment?: {
    id: string;
    content: string;
  };
};

// ============================================================================
// Validation Schemas
// ============================================================================

const GuestIdentitySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
});

const GuestCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(5000),
  parentId: z.string().nullish(),
  // Optional anchor fields
  anchorStart: z.coerce.number().int().nonnegative().nullish(),
  anchorEnd: z.coerce.number().int().nonnegative().nullish(),
  anchorText: z.string().nullish(),
  anchorPrefix: z.string().nullish(),
  anchorSuffix: z.string().nullish(),
});

// ============================================================================
// Guest Identity Actions
// ============================================================================

/**
 * Register or update a guest commenter identity for a share link.
 * Creates a JWT token and stores it in a cookie.
 */
export async function registerGuestIdentityAction(
  shareLinkToken: string,
  _prevState: GuestIdentityState,
  formData: FormData
): Promise<GuestIdentityState> {
  try {
    // Verify the share link exists and allows comments
    const shareLink = await getShareLinkByToken(shareLinkToken);

    if (!shareLink) {
      return { error: "Share link not found or expired" };
    }

    if (!shareLink.allowComments) {
      return { error: "Comments are not enabled for this share link" };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    const parsed = GuestIdentitySchema.safeParse({ name, email });

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return {
        error: errors.name?.[0] || errors.email?.[0] || "Invalid input",
      };
    }

    // Generate a unique fingerprint for this guest session
    const fingerprint = generateTokenFingerprint();

    // Create or update guest commenter record
    const guest = await upsertGuestCommenter({
      email: parsed.data.email,
      name: parsed.data.name,
      shareLinkId: shareLink.id,
      tokenFingerprint: fingerprint,
    });

    // Create JWT token
    const { token } = await createGuestToken({
      guestId: guest.id,
      email: guest.email,
      name: guest.name,
      shareLinkToken,
      fingerprint,
    });

    // Set the token in a cookie
    const cookieStore = await cookies();
    const cookieOptions = getGuestTokenCookieOptions();
    cookieStore.set(cookieOptions.name, token, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: cookieOptions.maxAge,
    });

    return {
      success: true,
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
      },
    };
  } catch (error) {
    console.error("Error registering guest identity:", error);
    return { error: "Failed to register. Please try again." };
  }
}

/**
 * Get the current guest identity from the cookie.
 * Returns null if not authenticated or token is invalid.
 */
export async function getGuestIdentityAction(
  shareLinkToken: string
): Promise<GuestIdentityState> {
  try {
    const cookieStore = await cookies();
    const tokenValue = cookieStore.get(GUEST_TOKEN_COOKIE)?.value;
    const token = extractGuestToken(tokenValue);

    if (!token) {
      return { error: "Not authenticated" };
    }

    const verified = await verifyGuestToken(token);

    if (!verified) {
      return { error: "Session expired. Please re-enter your details." };
    }

    // Verify the token is for this share link
    if (verified.shareLinkToken !== shareLinkToken) {
      return { error: "Invalid session for this link" };
    }

    // Verify guest still exists
    const guest = await getGuestCommenterById(verified.guestId);

    if (!guest) {
      return { error: "Guest not found" };
    }

    return {
      success: true,
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
      },
    };
  } catch (error) {
    console.error("Error getting guest identity:", error);
    return { error: "Failed to verify identity" };
  }
}

/**
 * Clear the guest identity cookie.
 */
export async function clearGuestIdentityAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(GUEST_TOKEN_COOKIE);
    return { success: true };
  } catch (error) {
    console.error("Error clearing guest identity:", error);
    return { success: false };
  }
}

// ============================================================================
// Guest Comment Actions
// ============================================================================

/**
 * Create a comment as a guest on a shared document.
 */
export async function createGuestCommentAction(
  shareLinkToken: string,
  _prevState: GuestCommentState,
  formData: FormData
): Promise<GuestCommentState> {
  try {
    // Verify the share link and get the document
    const sharedDoc = await getSharedDocumentByToken(shareLinkToken);

    if (!sharedDoc) {
      return { error: "Share link not found or expired" };
    }

    if (!sharedDoc.shareLink.allowComments) {
      return { error: "Comments are not enabled for this share link" };
    }

    // Verify guest identity from cookie
    const cookieStore = await cookies();
    const tokenValue = cookieStore.get(GUEST_TOKEN_COOKIE)?.value;
    const token = extractGuestToken(tokenValue);

    if (!token) {
      return { error: "Please enter your name and email to comment" };
    }

    const verified = await verifyGuestToken(token);

    if (!verified) {
      return { error: "Session expired. Please re-enter your details." };
    }

    // Verify the token is for this share link
    if (verified.shareLinkToken !== shareLinkToken) {
      return { error: "Invalid session for this link" };
    }

    // Parse comment data
    const content = formData.get("content") as string;
    const parentId = formData.get("parentId") as string | null;
    const anchorStart = formData.get("anchorStart");
    const anchorEnd = formData.get("anchorEnd");
    const anchorText = formData.get("anchorText");
    const anchorPrefix = formData.get("anchorPrefix");
    const anchorSuffix = formData.get("anchorSuffix");

    const parsed = GuestCommentSchema.safeParse({
      content,
      parentId,
      anchorStart,
      anchorEnd,
      anchorText,
      anchorPrefix,
      anchorSuffix,
    });

    if (!parsed.success) {
      return {
        error:
          parsed.error.flatten().fieldErrors.content?.[0] || "Invalid input",
      };
    }

    // Create the comment with guest commenter ID
    const comment = await createDocumentComment({
      documentId: sharedDoc.document.id,
      documentCreatedAt: sharedDoc.document.createdAt,
      userId: null, // No authenticated user
      guestCommenterId: verified.guestId,
      content: parsed.data.content,
      parentId: parsed.data.parentId || null,
      anchorStart: parsed.data.anchorStart ?? null,
      anchorEnd: parsed.data.anchorEnd ?? null,
      anchorText: parsed.data.anchorText ?? null,
      anchorPrefix: parsed.data.anchorPrefix ?? null,
      anchorSuffix: parsed.data.anchorSuffix ?? null,
    });

    // Revalidate caches
    revalidateTag(documentCommentsTag(sharedDoc.document.id), "max");
    revalidateTag(shareLinkTag(shareLinkToken), "max");

    return {
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
      },
    };
  } catch (error) {
    console.error("Error creating guest comment:", error);
    return { error: "Failed to post comment. Please try again." };
  }
}
