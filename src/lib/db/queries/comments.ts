import "server-only";

import { db } from "@/lib/db";
import {
  DocumentCommentTable,
  UserTable,
  type DocumentComment,
  type User,
} from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

export interface CommentWithAuthor {
  comment: DocumentComment;
  author: Pick<User, "id" | "name" | "email" | "imageUrl">;
}

export const listDocumentComments = async ({
  documentId,
  documentCreatedAt,
}: {
  documentId: string;
  documentCreatedAt: Date;
}): Promise<CommentWithAuthor[]> => {
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
    .innerJoin(
      UserTable,
      eq(DocumentCommentTable.userId, UserTable.id)
    )
    .where(
      and(
        eq(DocumentCommentTable.documentId, documentId),
        eq(
          DocumentCommentTable.documentCreatedAt,
          documentCreatedAt
        )
      )
    )
    .orderBy(
      asc(DocumentCommentTable.createdAt),
      asc(DocumentCommentTable.id)
    );

  return comments;
};

export const getDocumentCommentById = async (id: string) => {
  const [comment] = await db
    .select()
    .from(DocumentCommentTable)
    .where(eq(DocumentCommentTable.id, id))
    .limit(1);

  return comment ?? null;
};
