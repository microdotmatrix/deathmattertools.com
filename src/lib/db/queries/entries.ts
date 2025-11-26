import { isOrganizationOwner } from "@/lib/auth/organization-roles";
import { db } from "@/lib/db";
import type { Document, Entry } from "@/lib/db/schema";
import {
  DocumentTable,
  EntryDetailsTable,
  EntryTable,
  UserUploadTable
} from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import { cache } from "react";

// ============================================================================
// Types
// ============================================================================

export type EntryAccessRole = "owner" | "org_admin" | "org_member";

export interface EntryAccessResult {
  entry: Entry;
  role: EntryAccessRole;
  canEdit: boolean;
  canView: boolean;
  isOrgOwner: boolean;
}

export interface EntryWithObituaries extends Entry {
  obituaries: Document[];
}

// ============================================================================
// Access Control Queries
// ============================================================================

/**
 * Get entries accessible to the current user (organization-aware)
 * Returns entries where:
 * - User is the owner, OR
 * - User is in the same organization as the entry
 * Includes obituaries for each entry
 */
export const getOrganizationEntries = cache(async (): Promise<EntryWithObituaries[]> => {
  const { userId, orgId } = await auth();

  if (!userId) {
    return [];
  }

  // First get the entries
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

  // Then get obituaries for all entries in a single query
  const entryIds = entries.map(entry => entry.id);
  const obituaries = entryIds.length > 0 
    ? await db
        .select()
        .from(DocumentTable)
        .where(inArray(DocumentTable.entryId, entryIds))
        .orderBy(desc(DocumentTable.createdAt))
    : [];

  // Group obituaries by entryId
  const obituariesByEntry = obituaries.reduce((acc, obituary) => {
    if (!acc[obituary.entryId]) {
      acc[obituary.entryId] = [];
    }
    acc[obituary.entryId].push(obituary);
    return acc;
  }, {} as Record<string, Document[]>);

  // Combine entries with their obituaries
  return entries.map((entry) => ({
    ...entry,
    obituaries: obituariesByEntry[entry.id] || [],
  })) as EntryWithObituaries[];
});

/**
 * @deprecated Use getOrganizationEntries instead
 * Kept for backward compatibility
 */
export const getCreatorEntries = getOrganizationEntries;

/**
 * Get entry with access control - determines if user can view/edit
 * Returns null if user has no access to the entry
 * 
 * Now includes organization admin check - org admins can edit team member entries
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
        isOrgOwner: false, // Owner but not via org admin rights
      };
    }

    // Check if user is in the same organization
    const sameOrganization =
      entry.organizationId && orgId && entry.organizationId === orgId;

    if (sameOrganization) {
      // Check if user is organization owner/admin
      const isOrgAdmin = await isOrganizationOwner(entry.organizationId!);

      if (isOrgAdmin) {
        // Organization admins can edit team member entries
        return {
          entry,
          role: "org_admin",
          canEdit: true,
          canView: true,
          isOrgOwner: true,
        };
      }

      // Regular organization member - view only
      return {
        entry,
        role: "org_member",
        canEdit: false,
        canView: true,
        isOrgOwner: false,
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