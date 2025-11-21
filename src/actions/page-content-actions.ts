"use server";

import { db } from "@/lib/db";
import { PageContentTable } from "@/lib/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type SessionClaims = Awaited<ReturnType<typeof auth>>["sessionClaims"];

/**
 * Extract role from Clerk session claims
 * Supports multiple claim formats for compatibility
 */
const extractRoleFromSession = (sessionClaims: SessionClaims | undefined): string | undefined => {
  if (!sessionClaims) return undefined;

  const publicMetadataRole = (sessionClaims as { public_metadata?: { role?: unknown } }).public_metadata?.role;
  if (typeof publicMetadataRole === "string") {
    return publicMetadataRole;
  }

  const orgShortcutRole = (sessionClaims as { o?: { rol?: unknown } }).o?.rol;
  if (typeof orgShortcutRole === "string") {
    return orgShortcutRole;
  }

  const metadataClaimRole = (sessionClaims as { metadata?: { role?: unknown } }).metadata?.role;
  if (typeof metadataClaimRole === "string") {
    return metadataClaimRole;
  }

  return undefined;
};

/**
 * Update page content (system_admin only)
 */
export async function updatePageContentAction(data: {
  slug: string;
  title: string;
  content: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Check authentication
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized: Not authenticated" };
    }

    // Check authorization - system_admin only
    const user = await currentUser();
    const userRoleFromProfile = user?.publicMetadata?.role;
    const userRoleFromSession = extractRoleFromSession(sessionClaims);
    const userRole = typeof userRoleFromProfile === "string" ? userRoleFromProfile : userRoleFromSession;

    if (userRole !== "system_admin") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    // Update page content
    await db
      .update(PageContentTable)
      .set({
        title: data.title,
        content: data.content,
        updatedAt: new Date(),
      })
      .where(eq(PageContentTable.slug, data.slug));

    // Revalidate the specific page path
    revalidatePath(`/${data.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating page content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update page content",
    };
  }
}
