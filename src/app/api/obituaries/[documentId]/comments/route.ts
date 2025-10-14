import { createDocumentComment } from "@/lib/db/mutations";
import {
  getDocumentCommentById,
  getDocumentWithAccess,
  listDocumentComments,
} from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { documentCommentsTag } from "@/lib/cache";

type Params = Promise<{ documentId: string }>;

const CommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  parentId: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Params }
) {
  const { userId, orgId } = await auth();
  const { documentId } = await params;

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

  const comments = await listDocumentComments({
    documentId: access.document.id,
    documentCreatedAt: access.document.createdAt,
  });

  return NextResponse.json({ comments });
}

export async function POST(
  request: Request,
  { params }: { params: Params }
) {
  const { userId, orgId } = await auth();
  const { documentId } = await params;

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

  if (!access.canComment) {
    return NextResponse.json(
      { error: "You do not have permission to comment" },
      { status: 403 }
    );
  }

  const json = await request.json();
  const parsed = CommentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { content, parentId } = parsed.data;

  if (parentId) {
    const parent = await getDocumentCommentById(parentId);
    if (
      !parent ||
      parent.documentId !== access.document.id ||
      parent.documentCreatedAt.getTime() !==
        access.document.createdAt.getTime()
    ) {
      return NextResponse.json(
        { error: "Invalid parent comment" },
        { status: 400 }
      );
    }
  }

  const comment = await createDocumentComment({
    documentId: access.document.id,
    documentCreatedAt: access.document.createdAt,
    userId,
    content,
    parentId: parentId ?? null,
  });

  revalidateTag(documentCommentsTag(access.document.id));

  return NextResponse.json({ comment });
}
