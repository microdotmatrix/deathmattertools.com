import {
  setDocumentOrganization,
  updateDocumentOrganizationCommenting,
} from "@/lib/db/mutations";
import { getDocumentById } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { documentTag } from "@/lib/cache";

const UpdateSchema = z.object({
  enabled: z.boolean(),
});

type Params = Promise<{ documentId: string }>;

export async function PATCH(
  request: Request,
  { params }: { params: Params }
) {
  const { userId, orgId } = await auth();
  const { documentId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const document = await getDocumentById(documentId);

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (document.userId !== userId) {
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

  const { enabled } = parsed.data;

  if (document.organizationId && document.organizationId !== orgId) {
    return NextResponse.json(
      {
        error:
          "Switch to the organization associated with this obituary to update collaboration settings.",
      },
      { status: 403 }
    );
  }

  if (enabled) {
    if (!orgId) {
      return NextResponse.json(
        {
          error:
            "Enable an organization in Clerk to share commenting access with teammates.",
        },
        { status: 400 }
      );
    }

    if (!document.organizationId) {
      const organizationResult = await setDocumentOrganization({
        id: document.id,
        organizationId: orgId,
      });

      if (organizationResult.error) {
        return NextResponse.json(
          { error: organizationResult.error },
          { status: 500 }
        );
      }

      document.organizationId = orgId;
    }
  }

  const updateResult = await updateDocumentOrganizationCommenting({
    id: document.id,
    enabled,
  });

  if (updateResult.error || !updateResult.document) {
    return NextResponse.json(
      { error: updateResult.error ?? "Failed to update settings" },
      { status: 500 }
    );
  }

  revalidateTag(documentTag(document.id));

  return NextResponse.json({
    document: updateResult.document,
  });
}
