import { db } from "@/lib/db";
import { DocumentCommentTable } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const createDocumentComment = async ({
  documentId,
  documentCreatedAt,
  userId,
  content,
  parentId = null,
}: {
  documentId: string;
  documentCreatedAt: Date;
  userId: string;
  content: string;
  parentId?: string | null;
}) => {
  const now = new Date();
  const [comment] = await db
    .insert(DocumentCommentTable)
    .values({
      documentId,
      documentCreatedAt,
      userId,
      content,
      parentId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return comment;
};

export const updateDocumentComment = async ({
  commentId,
  documentId,
  documentCreatedAt,
  userId,
  content,
}: {
  commentId: string;
  documentId: string;
  documentCreatedAt: Date;
  userId: string;
  content: string;
}) => {
  const now = new Date();
  const [comment] = await db
    .update(DocumentCommentTable)
    .set({
      content,
      updatedAt: now,
    })
    .where(
      and(
        eq(DocumentCommentTable.id, commentId),
        eq(DocumentCommentTable.documentId, documentId),
        eq(
          DocumentCommentTable.documentCreatedAt,
          documentCreatedAt
        ),
        eq(DocumentCommentTable.userId, userId)
      )
    )
    .returning();

  return comment ?? null;
};

export const deleteDocumentComment = async ({
  commentId,
  documentId,
  documentCreatedAt,
  userId,
}: {
  commentId: string;
  documentId: string;
  documentCreatedAt: Date;
  userId: string;
}) => {
  const [comment] = await db
    .delete(DocumentCommentTable)
    .where(
      and(
        eq(DocumentCommentTable.id, commentId),
        eq(DocumentCommentTable.documentId, documentId),
        eq(
          DocumentCommentTable.documentCreatedAt,
          documentCreatedAt
        ),
        eq(DocumentCommentTable.userId, userId)
      )
    )
    .returning();

  return comment ?? null;
};
