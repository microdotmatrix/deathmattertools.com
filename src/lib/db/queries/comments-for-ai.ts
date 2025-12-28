import "server-only";

import { db } from "@/lib/db";
import {
  DocumentCommentTable,
  UserTable,
  type DocumentComment,
} from "@/lib/db/schema";
import { and, asc, eq, isNotNull, sql } from "drizzle-orm";

export interface CommentForAI {
  id: string;
  content: string;
  authorName: string;
  anchor: {
    start: number;
    end: number;
    text: string;
  } | null;
  thread: Array<{
    authorName: string;
    content: string;
  }>;
  createdAt: Date;
}

interface CommentWithAuthorRaw {
  comment: DocumentComment;
  authorName: string | null;
}

/**
 * Get approved comments for a document, formatted for AI context.
 * Returns comments with full thread context, prioritizing anchored comments.
 */
export async function getApprovedCommentsForAI({
  documentId,
  documentCreatedAt,
}: {
  documentId: string;
  documentCreatedAt: Date;
}): Promise<CommentForAI[]> {
  // Fetch all approved comments with author names
  const rawComments = await db
    .select({
      comment: DocumentCommentTable,
      authorName: UserTable.name,
    })
    .from(DocumentCommentTable)
    .innerJoin(UserTable, eq(DocumentCommentTable.userId, UserTable.id))
    .where(
      and(
        eq(DocumentCommentTable.documentId, documentId),
        eq(DocumentCommentTable.documentCreatedAt, documentCreatedAt),
        eq(DocumentCommentTable.status, "approved")
      )
    )
    .orderBy(
      // Prioritize anchored comments by position, then by creation date
      sql`${DocumentCommentTable.anchorStart} NULLS LAST`,
      asc(DocumentCommentTable.createdAt)
    );

  // Build a map for thread lookup
  const commentMap = new Map<string, CommentWithAuthorRaw>();
  for (const row of rawComments) {
    commentMap.set(row.comment.id, row);
  }

  // Get all comments (including pending/denied) to build full threads
  const allComments = await db
    .select({
      comment: DocumentCommentTable,
      authorName: UserTable.name,
    })
    .from(DocumentCommentTable)
    .innerJoin(UserTable, eq(DocumentCommentTable.userId, UserTable.id))
    .where(
      and(
        eq(DocumentCommentTable.documentId, documentId),
        eq(DocumentCommentTable.documentCreatedAt, documentCreatedAt)
      )
    )
    .orderBy(asc(DocumentCommentTable.createdAt));

  // Build thread context for each approved comment
  const allCommentMap = new Map<string, CommentWithAuthorRaw>();
  for (const row of allComments) {
    allCommentMap.set(row.comment.id, row);
  }

  // Build result with threads
  const result: CommentForAI[] = [];

  for (const row of rawComments) {
    // Only include top-level approved comments (not replies to other comments)
    // Replies will be included in their parent's thread
    if (row.comment.parentId) {
      continue;
    }

    const thread: CommentForAI["thread"] = [];

    // Find all replies to this comment
    for (const reply of allComments) {
      if (reply.comment.parentId === row.comment.id) {
        thread.push({
          authorName: reply.authorName || "Unknown",
          content: reply.comment.content,
        });
      }
    }

    result.push({
      id: row.comment.id,
      content: row.comment.content,
      authorName: row.authorName || "Unknown",
      anchor:
        row.comment.anchorStart !== null &&
        row.comment.anchorEnd !== null &&
        row.comment.anchorText
          ? {
              start: row.comment.anchorStart,
              end: row.comment.anchorEnd,
              text: row.comment.anchorText,
            }
          : null,
      thread,
      createdAt: row.comment.createdAt,
    });
  }

  return result;
}

/**
 * Get count of approved comments for a document.
 */
export async function getApprovedCommentCount({
  documentId,
  documentCreatedAt,
}: {
  documentId: string;
  documentCreatedAt: Date;
}): Promise<number> {
  const [result] = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(DocumentCommentTable)
    .where(
      and(
        eq(DocumentCommentTable.documentId, documentId),
        eq(DocumentCommentTable.documentCreatedAt, documentCreatedAt),
        eq(DocumentCommentTable.status, "approved"),
        // Only count top-level comments, not replies
        sql`${DocumentCommentTable.parentId} IS NULL`
      )
    );

  return Number(result?.count ?? 0);
}
