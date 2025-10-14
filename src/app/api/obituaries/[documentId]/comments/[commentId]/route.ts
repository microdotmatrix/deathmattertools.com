import {
  deleteDocumentComment,
  updateDocumentComment,
} from "@/lib/db/mutations";
import {
  getDocumentCommentById,
  getDocumentWithAccess,
} from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { documentCommentsTag } from "@/lib/cache";

type Params = Promise<{ documentId: string; commentId: string }>;

const UpdateSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

const canModerate = (role: string) => role === "owner";

export async function PATCH(
  request: Request,
  { params }: { params: Params }
) {
  const { userId, orgId } = await auth();
  const { documentId, commentId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getDocumentWithAccess({
    documentId,
    userId,
    orgId,
  });

  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comment = await getDocumentCommentById(commentId);

  if (
    !comment ||
    comment.documentId !== access.document.id ||
    comment.documentCreatedAt.getTime() !==
      access.document.createdAt.getTime()
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (comment.userId !== userId && !canModerate(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json();
  const parsed = UpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updated = await updateDocumentComment({
    commentId,
    documentId: access.document.id,
    documentCreatedAt: access.document.createdAt,
    userId: comment.userId,
    content: parsed.data.content,
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Unable to update comment" },
      { status: 400 }
    );
  }

  revalidateTag(documentCommentsTag(access.document.id));

  return NextResponse.json({ comment: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Params }
) {
  const { userId, orgId } = await auth();
  const { documentId, commentId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getDocumentWithAccess({
    documentId,
    userId,
    orgId,
  });

  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comment = await getDocumentCommentById(commentId);

  if (
    !comment ||
    comment.documentId !== access.document.id ||
    comment.documentCreatedAt.getTime() !==
      access.document.createdAt.getTime()
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (comment.userId !== userId && !canModerate(access.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await deleteDocumentComment({
    commentId,
    documentId: access.document.id,
    documentCreatedAt: access.document.createdAt,
    userId: comment.userId,
  });

  if (!deleted) {
    return NextResponse.json(
      { error: "Unable to delete comment" },
      { status: 400 }
    );
  }

  revalidateTag(documentCommentsTag(access.document.id));

  return NextResponse.json({ success: true });
}
