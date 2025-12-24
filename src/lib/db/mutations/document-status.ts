"use server";

import { isOrganizationOwner } from "@/lib/auth/organization-roles";
import {
  documentTag,
  documentsByEntryTag,
  entryDetailTag,
  entryListTag,
  orgEntriesTag,
} from "@/lib/cache";
import { db } from "@/lib/db";
import { DocumentTable } from "@/lib/db/schema";
import { type DocumentStatus, isDocumentStatus } from "@/lib/document-status";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

/**
 * Update document status - owner or org admin only
 *
 * @param documentId - ID of the document to update
 * @param status - New status value
 * @returns Success or error object
 */
export async function updateDocumentStatusAction(
  documentId: string,
  status: DocumentStatus
): Promise<{ success: true } | { error: string }> {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Validate status value
  if (!isDocumentStatus(status)) {
    return { error: "Invalid status value" };
  }

  try {
    // Get the document with its entry to check ownership and organization
    const document = await db.query.DocumentTable.findFirst({
      where: eq(DocumentTable.id, documentId),
      with: {
        entry: true,
      },
    });

    if (!document) {
      return { error: "Document not found" };
    }

    // Check if user is the document owner
    const isOwner = document.userId === userId;

    // Check if user is organization admin (check entry's organization)
    let isOrgAdmin = false;
    if (document.entry.organizationId && orgId === document.entry.organizationId) {
      isOrgAdmin = await isOrganizationOwner(document.entry.organizationId);
    }

    // Allow update if user is owner OR org admin
    if (!isOwner && !isOrgAdmin) {
      return {
        error: "You do not have permission to change this document's status",
      };
    }

    // Perform the update
    await db
      .update(DocumentTable)
      .set({
        status,
      })
      .where(eq(DocumentTable.id, documentId));

    updateTag(documentTag(documentId));
    updateTag(documentsByEntryTag(document.entryId));
    updateTag(entryDetailTag(document.entryId));
    updateTag(entryListTag(userId));
    if (orgId) updateTag(orgEntriesTag(orgId));

    revalidatePath("/dashboard");
    revalidatePath(`/${document.entryId}`);
    revalidatePath(`/${document.entryId}/obituaries/${documentId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating document status:", error);
    return { error: "Failed to update document status" };
  }
}
