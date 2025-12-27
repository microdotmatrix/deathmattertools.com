import "server-only";

import { documentCommentsTag } from "@/lib/cache";
import { db } from "@/lib/db";
import {
    DocumentCommentTable,
    UserTable,
    type DocumentComment,
    type User,
} from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export interface CommentWithAuthor {
  comment: DocumentComment;
  author: Pick<User, "id" | "name" | "email" | "imageUrl">;
}

/**
 * List all comments for a document - cached with realtime profile
 * Uses short TTL since comments are frequently updated
 */
export async function listDocumentComments({
  documentId,
  documentCreatedAt,
}: {
  documentId: string;
  documentCreatedAt: Date;
}): Promise<CommentWithAuthor[]> {
  "use cache";
  cacheLife("realtime");
  cacheTag(documentCommentsTag(documentId));

  const comments = await db
    .select({
      comment: DocumentCommentTable,
      author: {
        id: UserTable.id,
        name: UserTable.name,
        email: UserTable.email,
        imageUrl: UserTable.imageUrl,
      },
    })
    .from(DocumentCommentTable)
    .innerJoin(UserTable, eq(DocumentCommentTable.userId, UserTable.id))
    .where(
      and(
        eq(DocumentCommentTable.documentId, documentId),
        eq(DocumentCommentTable.documentCreatedAt, documentCreatedAt)
      )
    )
    .orderBy(asc(DocumentCommentTable.createdAt), asc(DocumentCommentTable.id));

  return comments;
}

/**
 * Get a single comment by ID
 * Note: Not cached as this is primarily used in mutations
 * for ownership verification where fresh data is essential
 */
export async function getDocumentCommentById(id: string) {
  const [comment] = await db
    .select()
    .from(DocumentCommentTable)
    .where(eq(DocumentCommentTable.id, id))
    .limit(1);

  return comment ?? null;
}

/**
 * Get pending comment counts for multiple documents
 */
export async function getPendingDocumentCommentCounts(documentIds: string[]) {
  const { userId } = await auth();

  if (!userId || documentIds.length === 0) {
    return {};
  }

  try {
    const rows = await db
      .select({
        documentId: DocumentCommentTable.documentId,
        count: sql<number>`count(*)`,
      })
      .from(DocumentCommentTable)
      .where(
        and(
          inArray(DocumentCommentTable.documentId, documentIds),
          eq(DocumentCommentTable.status, "pending")
        )
      )
      .groupBy(DocumentCommentTable.documentId);

    return Object.fromEntries(
      rows.map((row) => [row.documentId, Number(row.count)])
    );
  } catch (error) {
    console.error("Failed to get pending document comment counts:", error);
    return {};
  }
}
