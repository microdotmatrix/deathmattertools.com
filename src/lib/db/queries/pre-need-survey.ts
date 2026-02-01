import "server-only";

import { db } from "@/lib/db";
import {
  PreNeedSurveyTable,
  PreNeedSurveyResponseTable,
  PreNeedSurveyAuditLogTable,
  ShareLinkTable,
  EntryTable,
  type PreNeedSurvey,
  type PreNeedSurveyResponse,
  type PreNeedSurveyAccessResult,
} from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, desc, isNull, or, gt } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import {
  surveyTag,
  surveysByUserTag,
  surveysByEntryTag,
  surveysByOrgTag,
  surveyResponseTag,
  shareLinkTag,
} from "@/lib/cache";
import { isOrganizationOwner } from "@/lib/auth/organization-roles";

// ============================================================================
// Survey Queries
// ============================================================================

/**
 * Get a survey by ID with access control
 */
export async function getSurveyWithAccess(
  surveyId: string
): Promise<(PreNeedSurveyAccessResult & { subjectName: string }) | null> {
  const { userId, orgId } = await auth();

  const survey = await getCachedSurveyById(surveyId);
  if (!survey) return null;

  // If no user is logged in, this is not accessible
  if (!userId) return null;

  // Get entry name for the subject
  const [entryData] = await db
    .select({ name: EntryTable.name })
    .from(EntryTable)
    .where(eq(EntryTable.id, survey.entryId));

  const subjectName = entryData?.name || "Unknown";

  // Owner has full access
  if (survey.userId === userId) {
    const response = await getLatestSurveyResponse(surveyId);
    return {
      survey,
      response,
      subjectName,
      role: "owner",
      canView: true,
      canEdit: true,
      canLock: true,
      canApprove: survey.status === "submitted" || survey.status === "under_review",
    };
  }

  // Org admin access
  if (survey.organizationId && orgId === survey.organizationId) {
    const isAdmin = await isOrganizationOwner(survey.organizationId);
    if (isAdmin) {
      const response = await getLatestSurveyResponse(surveyId);
      return {
        survey,
        response,
        subjectName,
        role: "org_admin",
        canView: true,
        canEdit: true,
        canLock: true,
        canApprove: survey.status === "submitted" || survey.status === "under_review",
      };
    }
  }

  return null;
}

/**
 * Get a survey by ID (cached)
 */
async function getCachedSurveyById(
  surveyId: string
): Promise<PreNeedSurvey | null> {
  "use cache";
  cacheLife("content");
  cacheTag(surveyTag(surveyId));

  try {
    const [survey] = await db
      .select()
      .from(PreNeedSurveyTable)
      .where(eq(PreNeedSurveyTable.id, surveyId));

    return survey ?? null;
  } catch (error) {
    console.error("Failed to get survey by id:", error);
    return null;
  }
}

/**
 * Get survey by share token (for public/client access)
 */
export async function getSurveyByShareToken(token: string): Promise<{
  survey: PreNeedSurvey;
  response: PreNeedSurveyResponse | null;
  shareLink: typeof ShareLinkTable.$inferSelect;
  entry: { id: string; name: string; image: string | null };
  subjectName: string;
  canEdit: boolean;
} | null> {
  "use cache";
  cacheLife("content");
  cacheTag(shareLinkTag(token));

  try {
    // Get the share link
    const [shareLink] = await db
      .select()
      .from(ShareLinkTable)
      .where(
        and(
          eq(ShareLinkTable.token, token),
          eq(ShareLinkTable.type, "survey"),
          eq(ShareLinkTable.isEnabled, true),
          or(
            isNull(ShareLinkTable.expiresAt),
            gt(ShareLinkTable.expiresAt, new Date())
          )
        )
      );

    if (!shareLink || !shareLink.surveyId) {
      return null;
    }

    // Get the survey
    const [survey] = await db
      .select()
      .from(PreNeedSurveyTable)
      .where(eq(PreNeedSurveyTable.id, shareLink.surveyId));

    if (!survey) {
      return null;
    }

    // Get the latest response
    const response = await getLatestSurveyResponse(survey.id);

    // Get entry info (required - surveys are always tied to entries)
    const [entryData] = await db
      .select({
        id: EntryTable.id,
        name: EntryTable.name,
        image: EntryTable.image,
      })
      .from(EntryTable)
      .where(eq(EntryTable.id, survey.entryId));

    if (!entryData) {
      return null;
    }

    // Check if client can edit based on status and lock
    const canEdit =
      !survey.isLocked &&
      ["shared", "submitted"].includes(survey.status);

    return {
      survey,
      response,
      shareLink,
      entry: entryData,
      subjectName: entryData.name,
      canEdit,
    };
  } catch (error) {
    console.error("Failed to get survey by share token:", error);
    return null;
  }
}

/**
 * Get all surveys for a user with entry names
 */
export async function getUserSurveys(): Promise<
  (PreNeedSurvey & { entryName: string })[]
> {
  const { userId } = await auth();
  if (!userId) return [];

  return getCachedUserSurveys(userId);
}

async function getCachedUserSurveys(
  userId: string
): Promise<(PreNeedSurvey & { entryName: string })[]> {
  "use cache";
  cacheLife("dashboard");
  cacheTag(surveysByUserTag(userId));

  try {
    const surveys = await db
      .select({
        survey: PreNeedSurveyTable,
        entryName: EntryTable.name,
      })
      .from(PreNeedSurveyTable)
      .innerJoin(EntryTable, eq(PreNeedSurveyTable.entryId, EntryTable.id))
      .where(eq(PreNeedSurveyTable.userId, userId))
      .orderBy(desc(PreNeedSurveyTable.createdAt));

    return surveys.map(({ survey, entryName }) => ({
      ...survey,
      entryName,
    }));
  } catch (error) {
    console.error("Failed to get user surveys:", error);
    return [];
  }
}

/**
 * Get surveys by entry ID
 */
export async function getSurveysByEntryId(
  entryId: string
): Promise<PreNeedSurvey[]> {
  "use cache";
  cacheLife("content");
  cacheTag(surveysByEntryTag(entryId));

  try {
    const surveys = await db
      .select()
      .from(PreNeedSurveyTable)
      .where(eq(PreNeedSurveyTable.entryId, entryId))
      .orderBy(desc(PreNeedSurveyTable.createdAt));

    return surveys;
  } catch (error) {
    console.error("Failed to get surveys by entry:", error);
    return [];
  }
}

/**
 * Get surveys pending review for organization
 */
export async function getOrgSurveysPendingReview(): Promise<PreNeedSurvey[]> {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return [];

  const isAdmin = await isOrganizationOwner(orgId);
  if (!isAdmin) return [];

  return getCachedOrgPendingSurveys(orgId);
}

async function getCachedOrgPendingSurveys(
  orgId: string
): Promise<PreNeedSurvey[]> {
  "use cache";
  cacheLife("dashboard");
  cacheTag(surveysByOrgTag(orgId));

  try {
    const surveys = await db
      .select()
      .from(PreNeedSurveyTable)
      .where(
        and(
          eq(PreNeedSurveyTable.organizationId, orgId),
          eq(PreNeedSurveyTable.status, "submitted")
        )
      )
      .orderBy(desc(PreNeedSurveyTable.updatedAt));

    return surveys;
  } catch (error) {
    console.error("Failed to get org pending surveys:", error);
    return [];
  }
}

// ============================================================================
// Response Queries
// ============================================================================

/**
 * Get the latest response for a survey
 */
export async function getLatestSurveyResponse(
  surveyId: string
): Promise<PreNeedSurveyResponse | null> {
  "use cache";
  cacheLife("content");
  cacheTag(surveyResponseTag(surveyId));

  try {
    const [response] = await db
      .select()
      .from(PreNeedSurveyResponseTable)
      .where(eq(PreNeedSurveyResponseTable.surveyId, surveyId))
      .orderBy(desc(PreNeedSurveyResponseTable.createdAt))
      .limit(1);

    return response ?? null;
  } catch (error) {
    console.error("Failed to get survey response:", error);
    return null;
  }
}

/**
 * Get response by ID
 */
export async function getSurveyResponseById(
  responseId: string
): Promise<PreNeedSurveyResponse | null> {
  try {
    const [response] = await db
      .select()
      .from(PreNeedSurveyResponseTable)
      .where(eq(PreNeedSurveyResponseTable.id, responseId));

    return response ?? null;
  } catch (error) {
    console.error("Failed to get survey response by id:", error);
    return null;
  }
}

// ============================================================================
// Audit Log Queries
// ============================================================================

/**
 * Get audit logs for a survey
 */
export async function getSurveyAuditLogs(
  surveyId: string
): Promise<typeof PreNeedSurveyAuditLogTable.$inferSelect[]> {
  try {
    const logs = await db
      .select()
      .from(PreNeedSurveyAuditLogTable)
      .where(eq(PreNeedSurveyAuditLogTable.surveyId, surveyId))
      .orderBy(desc(PreNeedSurveyAuditLogTable.createdAt));

    return logs;
  } catch (error) {
    console.error("Failed to get survey audit logs:", error);
    return [];
  }
}

// ============================================================================
// Dashboard Notification Helpers
// ============================================================================

/**
 * Get count of surveys pending review for dashboard notification
 */
export async function getPendingSurveyCount(): Promise<number> {
  const { userId, orgId } = await auth();
  if (!userId) return 0;

  try {
    // Get surveys owned by user that are submitted
    const ownSurveys = await db
      .select({ id: PreNeedSurveyTable.id })
      .from(PreNeedSurveyTable)
      .where(
        and(
          eq(PreNeedSurveyTable.userId, userId),
          eq(PreNeedSurveyTable.status, "submitted")
        )
      );

    // If org admin, also count org surveys
    let orgCount = 0;
    if (orgId) {
      const isAdmin = await isOrganizationOwner(orgId);
      if (isAdmin) {
        const orgSurveys = await db
          .select({ id: PreNeedSurveyTable.id })
          .from(PreNeedSurveyTable)
          .where(
            and(
              eq(PreNeedSurveyTable.organizationId, orgId),
              eq(PreNeedSurveyTable.status, "submitted")
            )
          );
        orgCount = orgSurveys.length;
      }
    }

    return ownSurveys.length + orgCount;
  } catch (error) {
    console.error("Failed to get pending survey count:", error);
    return 0;
  }
}
