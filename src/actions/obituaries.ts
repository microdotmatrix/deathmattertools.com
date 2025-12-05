"use server";

import { updateDocumentContent } from "@/lib/db/mutations/documents";
import { getDocumentWithAccess } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";

interface UpdateObituaryContentParams {
  documentId: string;
  entryId: string;
  content: string;
}

interface UpdateObituaryContentResult {
  success?: boolean;
  error?: string;
}

/**
 * Server action to update obituary content
 * Only owners can edit their obituaries
 */
export async function updateObituaryContent({
  documentId,
  entryId,
  content,
}: UpdateObituaryContentParams): Promise<UpdateObituaryContentResult> {
  try {
    // Authenticate user
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "You must be signed in to edit obituaries" };
    }

    // Verify document access and ownership
    const access = await getDocumentWithAccess({
      documentId,
      userId,
      orgId,
    });

    if (!access) {
      return { error: "Obituary not found" };
    }

    // Verify ownership
    if (access.role !== "owner") {
      return { error: "Only owners can edit obituaries" };
    }

    // Verify entryId matches
    if (access.document.entryId !== entryId) {
      return { error: "Invalid entry ID" };
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return { error: "Content cannot be empty" };
    }

    // Update document content
    const result = await updateDocumentContent({
      id: documentId,
      entryId,
      content,
      title: access.document.title,
      tokenUsage: access.document.tokenUsage ?? undefined,
    });

    if (result.error) {
      return { error: result.error };
    }

    // Revalidate document cache with stale-while-revalidate
    revalidateTag(documentTag(documentId), "max");
    revalidateTag(documentsByEntryTag(entryId), "max");

    return { success: true };
  } catch (error) {
    console.error("Failed to update obituary content:", error);
    
    // Return user-friendly error message
    if (error instanceof Error) {
      return { error: `Failed to save changes: ${error.message}` };
    }
    
    return { error: "Failed to save changes. Please try again." };
  }
}
