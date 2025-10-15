"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import {
  setDocumentOrganization,
  updateDocumentOrganizationCommenting,
} from "@/lib/db/mutations";
import { getDocumentById } from "@/lib/db/queries";
import { documentTag } from "@/lib/cache";

const UpdateSchema = z.object({
  enabled: z.boolean(),
});

type CommentingSettingsState = {
  success?: boolean;
  error?: string;
  document?: any;
};

export async function updateCommentingSettingsAction(
  documentId: string,
  enabled: boolean
): Promise<CommentingSettingsState> {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const document = await getDocumentById(documentId);

    if (!document) {
      return { error: "Document not found" };
    }

    if (document.userId !== userId) {
      return { error: "Forbidden" };
    }

    const parsed = UpdateSchema.safeParse({ enabled });

    if (!parsed.success) {
      return { error: "Invalid input" };
    }

    if (document.organizationId && document.organizationId !== orgId) {
      return {
        error:
          "Switch to the organization associated with this obituary to update collaboration settings.",
      };
    }

    if (enabled) {
      if (!orgId) {
        return {
          error:
            "Enable an organization in Clerk to share commenting access with teammates.",
        };
      }

      if (!document.organizationId) {
        const organizationResult = await setDocumentOrganization({
          id: document.id,
          organizationId: orgId,
        });

        if (organizationResult.error) {
          return { error: organizationResult.error };
        }

        document.organizationId = orgId;
      }
    }

    const updateResult = await updateDocumentOrganizationCommenting({
      id: document.id,
      enabled,
    });

    if (updateResult.error || !updateResult.document) {
      return { error: updateResult.error ?? "Failed to update settings" };
    }

    revalidateTag(documentTag(document.id));

    return {
      success: true,
      document: updateResult.document,
    };
  } catch (error) {
    console.error("Error updating commenting settings:", error);
    return { error: "Failed to update commenting settings" };
  }
}
