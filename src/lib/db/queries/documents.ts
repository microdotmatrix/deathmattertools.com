import "server-only";

import { db } from "@/lib/db";
import { DocumentTable, type Document } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const getDocumentsByEntryId = async (entryId: string) => {
  try {
    const documents = await db
      .select()
      .from(DocumentTable)
      .where(eq(DocumentTable.entryId, entryId))
      .orderBy(desc(DocumentTable.createdAt));

    return documents;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get documents");
  }
};

export const getDocumentById = async (id: string) => {
  try {
    const [selectedDocument] = await db
      .select()
      .from(DocumentTable)
      .where(eq(DocumentTable.id, id));

    return selectedDocument;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get document");
  }
};

export type DocumentAccessRole = "owner" | "viewer" | "commenter";

export interface DocumentAccessResult {
  document: Document;
  role: DocumentAccessRole;
  canComment: boolean;
  canEdit: boolean;
}

export const getDocumentWithAccess = async ({
  documentId,
  userId,
  orgId,
}: {
  documentId: string;
  userId: string;
  orgId?: string | null;
}): Promise<DocumentAccessResult | null> => {
  const document = await getDocumentById(documentId);

  if (!document) {
    return null;
  }

  if (document.userId === userId) {
    return {
      document,
      role: "owner",
      canComment: true,
      canEdit: true,
    };
  }

  const sameOrganization =
    document.organizationId && orgId && document.organizationId === orgId;

  if (!sameOrganization) {
    return null;
  }

  const canComment = document.organizationCommentingEnabled;
  const role: DocumentAccessRole = canComment ? "commenter" : "viewer";

  return {
    document,
    role,
    canComment,
    canEdit: false,
  };
};
