import { db } from "@/lib/db";
import {
  EntryDetailsTable,
  EntryTable,
  UserUploadTable,
} from "@/lib/db/schema";
import type { Entry } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, isNotNull, or, sql } from "drizzle-orm";
import { cache } from "react";

// ============================================================================
// Types
// ============================================================================

export type EntryAccessRole = "owner" | "org_member";

export interface EntryAccessResult {
  entry: Entry;
  role: EntryAccessRole;
  canEdit: boolean;
  canView: boolean;
}

// ============================================================================
// Access Control Queries
// ============================================================================

/**
 * Get entries accessible to the current user (organization-aware)
 * Returns entries where:
 * - User is the owner, OR
 * - User is in the same organization as the entry
 */
export const getOrganizationEntries = cache(async () => {
  const { userId, orgId } = await auth();

  if (!userId) {
    return [];
  }

  const entries = await db.query.EntryTable.findMany({
    where: orgId
      ? or(
          eq(EntryTable.userId, userId),
          and(
            eq(EntryTable.organizationId, orgId),
            isNotNull(EntryTable.organizationId)
          )
        )
      : eq(EntryTable.userId, userId),
    orderBy: (EntryTable, { desc }) => [desc(EntryTable.createdAt)],
  });

  return entries;
});

/**
 * @deprecated Use getOrganizationEntries instead
 * Kept for backward compatibility
 */
export const getCreatorEntries = getOrganizationEntries;

/**
 * Get entry with access control - determines if user can view/edit
 * Returns null if user has no access to the entry
 */
export const getEntryWithAccess = cache(
  async (entryId: string): Promise<EntryAccessResult | null> => {
    const { userId, orgId } = await auth();

    if (!userId) {
      return null;
    }

    const entry = await db.query.EntryTable.findFirst({
      where: eq(EntryTable.id, entryId),
    });

    if (!entry) {
      return null;
    }

    // Owner has full access
    if (entry.userId === userId) {
      return {
        entry,
        role: "owner",
        canEdit: true,
        canView: true,
      };
    }

    // Organization member has view-only access
    const sameOrganization =
      entry.organizationId && orgId && entry.organizationId === orgId;

    if (sameOrganization) {
      return {
        entry,
        role: "org_member",
        canEdit: false,
        canView: true,
      };
    }

    // No access
    return null;
  }
);

/**
 * Get entry by ID (owner-only access)
 * @deprecated Use getEntryWithAccess for organization-aware access
 */
export const getEntryById = cache(async (entryId: string) => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const entry = await db.query.EntryTable.findFirst({
    where: (EntryTable, { eq, and }) =>
      and(eq(EntryTable.userId, userId), eq(EntryTable.id, entryId)),
  });

  return entry;
});

export const getUserUploads = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  // Fetch all uploads for this user
  const uploads = await db.query.UserUploadTable.findMany({
    where: eq(UserUploadTable.userId, userId),
    orderBy: (UserUploadTable, { desc }) => [desc(UserUploadTable.createdAt)],
  });

  return uploads;
});

export const getEntryDetailsById = cache(async (entryId: string) => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const entryDetails = await db.query.EntryDetailsTable.findFirst({
    where: eq(EntryDetailsTable.entryId, entryId),
  });

  return entryDetails;
});

export const countUploadsForEntry = async (entryId: string) => {
  const result = await db
    .select({ value: sql<number>`count(*)` })
    .from(UserUploadTable)
    .where(eq(UserUploadTable.entryId, entryId));

  return result[0]?.value ?? 0;
};