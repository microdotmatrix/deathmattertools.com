import { isOrganizationOwner } from "@/lib/auth/organization-roles";
import {
    entryDetailTag,
    entryListTag,
    entryUploadsTag,
    orgEntriesTag,
    userUploadsTag,
} from "@/lib/cache";
import { db } from "@/lib/db";
import type { Document, Entry } from "@/lib/db/schema";
import {
    DocumentTable,
    EntryDetailsTable,
    EntryTable,
    UserUploadTable,
} from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

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
export async function getOrganizationEntries(): Promise<EntryWithObituaries[]> {
  const { userId, orgId } = await auth();

  if (!userId) {
    return [];
  }

  // Delegate to cached function with auth data as cache key
  return getCachedOrganizationEntries(userId, orgId ?? null);
}

/**
 * Cached internal function - auth data passed as props becomes cache key
 */
async function getCachedOrganizationEntries(
  userId: string,
  orgId: string | null
): Promise<EntryWithObituaries[]> {
  "use cache";
  cacheLife("dashboard");
  cacheTag(entryListTag(userId));
  if (orgId) cacheTag(orgEntriesTag(orgId));

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
  const entryIds = entries.map((entry) => entry.id);
  const obituaries =
    entryIds.length > 0
      ? await db
          .select()
          .from(DocumentTable)
          .where(inArray(DocumentTable.entryId, entryIds))
          .orderBy(desc(DocumentTable.createdAt))
      : [];

  // Group obituaries by entryId
  const obituariesByEntry = obituaries.reduce(
    (acc, obituary) => {
      if (!acc[obituary.entryId]) {
        acc[obituary.entryId] = [];
      }
      acc[obituary.entryId].push(obituary);
      return acc;
    },
    {} as Record<string, Document[]>
  );

  // Combine entries with their obituaries
  return entries.map((entry) => ({
    ...entry,
    obituaries: obituariesByEntry[entry.id] || [],
  })) as EntryWithObituaries[];
}

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
 *
 * Note: This function cannot be fully cached because access control
 * depends on runtime auth state. We cache the entry lookup separately.
 */
export async function getEntryWithAccess(
  entryId: string
): Promise<EntryAccessResult | null> {
  const { userId, orgId } = await auth();

  if (!userId) {
    return null;
  }

  // Get cached entry data
  const entry = await getCachedEntryById(entryId);

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
      isOrgOwner: false,
    };
  }

  // Check if user is in the same organization
  const sameOrganization =
    entry.organizationId && orgId && entry.organizationId === orgId;

  if (sameOrganization) {
    // Check if user is organization owner/admin
    const isOrgAdmin = await isOrganizationOwner(entry.organizationId!);

    if (isOrgAdmin) {
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

/**
 * Cached entry lookup by ID
 */
async function getCachedEntryById(entryId: string): Promise<Entry | undefined> {
  "use cache";
  cacheLife("content");
  cacheTag(entryDetailTag(entryId));

  return db.query.EntryTable.findFirst({
    where: eq(EntryTable.id, entryId),
  });
}

/**
 * Get entry by ID (owner-only access)
 * @deprecated Use getEntryWithAccess for organization-aware access
 */
export async function getEntryById(entryId: string) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Use the cached entry lookup, then verify ownership
  const entry = await getCachedEntryById(entryId);

  if (!entry || entry.userId !== userId) {
    return null;
  }

  return entry;
}

/**
 * Get user uploads - auth wrapper with cached data fetch
 */
export async function getUserUploads() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  return getCachedUserUploads(userId);
}

async function getCachedUserUploads(userId: string) {
  "use cache";
  cacheLife("dashboard");
  cacheTag(userUploadsTag(userId));

  return db.query.UserUploadTable.findMany({
    where: eq(UserUploadTable.userId, userId),
    orderBy: (UserUploadTable, { desc }) => [desc(UserUploadTable.createdAt)],
  });
}

/**
 * Get entry details by ID - auth wrapper with cached data fetch
 */
export async function getEntryDetailsById(entryId: string) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return getCachedEntryDetails(entryId);
}

async function getCachedEntryDetails(entryId: string) {
  "use cache";
  cacheLife("content");
  cacheTag(entryDetailTag(entryId));

  return db.query.EntryDetailsTable.findFirst({
    where: eq(EntryDetailsTable.entryId, entryId),
  });
}

/**
 * Count uploads for an entry - cached
 */
export async function countUploadsForEntry(entryId: string) {
  "use cache";
  cacheLife("content");
  cacheTag(entryUploadsTag(entryId));

  const result = await db
    .select({ value: sql<number>`count(*)` })
    .from(UserUploadTable)
    .where(eq(UserUploadTable.entryId, entryId));

  return result[0]?.value ?? 0;
}