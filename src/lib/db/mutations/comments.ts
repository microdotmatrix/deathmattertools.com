import { db } from "@/lib/db";
import { DocumentCommentTable } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const createDocumentComment = async ({
  documentId,
  documentCreatedAt,
  userId,
  content,
  parentId = null,
  anchorStart = null,
  anchorEnd = null,
  anchorText = null,
  anchorPrefix = null,
  anchorSuffix = null,
}: {
  documentId: string;
  documentCreatedAt: Date;
  userId: string;
  content: string;
  parentId?: string | null;
  anchorStart?: number | null;
  anchorEnd?: number | null;
  anchorText?: string | null;
  anchorPrefix?: string | null;
  anchorSuffix?: string | null;
}) => {
  const now = new Date();
  const commentId = crypto.randomUUID();
  
  const [comment] = await db
    .insert(DocumentCommentTable)
    .values({
      id: commentId,
      documentId,
      documentCreatedAt,
      userId,
      content,
      parentId,
      createdAt: now,
      updatedAt: now,
      // Anchor fields
      anchorStart,
      anchorEnd,
      anchorText,
      anchorPrefix,
      anchorSuffix,
      // anchorValid and anchorStatus use defaults from schema
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

export const updateCommentAnchorStatus = async ({
  commentId,
  documentId,
  documentCreatedAt,
  status,
}: {
  commentId: string;
  documentId: string;
  documentCreatedAt: Date;
  status: "approved" | "denied";
}) => {
  const now = new Date();
  const [comment] = await db
    .update(DocumentCommentTable)
    .set({
      anchorStatus: status,
      updatedAt: now,
    })
    .where(
      and(
        eq(DocumentCommentTable.id, commentId),
        eq(DocumentCommentTable.documentId, documentId),
        eq(DocumentCommentTable.documentCreatedAt, documentCreatedAt)
      )
    )
    .returning();

  return comment ?? null;
};
