import { db } from "@/lib/db";
import {
  PreNeedSurveyTable,
  PreNeedSurveyResponseTable,
  PreNeedSurveyAuditLogTable,
  ShareLinkTable,
  type PreNeedSurveyInsert,
  type PreNeedSurveyResponseInsert,
  type SurveyStatus,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { hash as bcryptHash } from "bcryptjs";

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate a URL-safe share token for surveys
 */
export function generateSurveyShareToken(): string {
  return nanoid(21);
}

// ============================================================================
// Survey Mutations
// ============================================================================

/**
 * Create a new pre-need survey for an entry with share link
 */
export async function createPreNeedSurvey({
  userId,
  organizationId,
  entryId,
  title,
  clientName,
  clientEmail,
  clientRelationship,
  password,
  expiresAt,
}: {
  userId: string;
  organizationId?: string | null;
  entryId: string; // Required - surveys are always tied to entries
  title?: string;
  clientName?: string | null;
  clientEmail?: string | null;
  clientRelationship?: string | null;
  password?: string | null;
  expiresAt?: Date | null;
}): Promise<{
  survey: typeof PreNeedSurveyTable.$inferSelect;
  shareLink: typeof ShareLinkTable.$inferSelect;
  shareToken: string;
}> {
  const now = new Date();
  const token = generateSurveyShareToken();

  // Hash password if provided
  const passwordHash = password ? await bcryptHash(password, 10) : null;

  // Create survey and share link in transaction
  const surveyId = crypto.randomUUID();

  // First create the share link
  const [shareLink] = await db
    .insert(ShareLinkTable)
    .values({
      token,
      type: "survey",
      surveyId,
      entryId,
      createdBy: userId,
      isEnabled: true,
      allowComments: false,
      passwordHash,
      expiresAt: expiresAt ?? null,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Then create the survey
  const surveyData: PreNeedSurveyInsert = {
    id: surveyId,
    userId,
    organizationId: organizationId ?? null,
    entryId,
    title: title ?? "Pre-Need Survey",
    clientName: clientName ?? null,
    clientEmail: clientEmail ?? null,
    clientRelationship: clientRelationship ?? null,
    status: "shared", // Start as shared since we're creating with share link
    shareLinkId: shareLink.id,
    shareToken: token, // Cache token for easy access
    completionPercentage: 0,
    currentStep: 1,
    createdAt: now,
    updatedAt: now,
  };

  const [survey] = await db
    .insert(PreNeedSurveyTable)
    .values(surveyData)
    .returning();

  // Log the creation
  await createSurveyAuditLog({
    surveyId: survey.id,
    actorType: "owner",
    actorId: userId,
    action: "created",
  });

  await createSurveyAuditLog({
    surveyId: survey.id,
    actorType: "owner",
    actorId: userId,
    action: "shared",
  });

  return { survey, shareLink, shareToken: token };
}

/**
 * Update survey status
 */
export async function updateSurveyStatus({
  surveyId,
  status,
  userId,
}: {
  surveyId: string;
  status: SurveyStatus;
  userId: string;
}): Promise<typeof PreNeedSurveyTable.$inferSelect | null> {
  const now = new Date();

  // Get current status for audit log
  const [current] = await db
    .select({ status: PreNeedSurveyTable.status })
    .from(PreNeedSurveyTable)
    .where(eq(PreNeedSurveyTable.id, surveyId));

  if (!current) return null;

  const [survey] = await db
    .update(PreNeedSurveyTable)
    .set({
      status,
      statusChangedAt: now,
      statusChangedBy: userId,
      updatedAt: now,
    })
    .where(eq(PreNeedSurveyTable.id, surveyId))
    .returning();

  // Log status change
  await createSurveyAuditLog({
    surveyId,
    actorType: "owner",
    actorId: userId,
    action: "status_changed",
    previousStatus: current.status,
    newStatus: status,
  });

  return survey ?? null;
}

/**
 * Lock a survey
 */
export async function lockSurvey({
  surveyId,
  userId,
}: {
  surveyId: string;
  userId: string;
}): Promise<typeof PreNeedSurveyTable.$inferSelect | null> {
  const now = new Date();

  const [survey] = await db
    .update(PreNeedSurveyTable)
    .set({
      isLocked: true,
      lockedAt: now,
      lockedBy: userId,
      status: "locked",
      statusChangedAt: now,
      statusChangedBy: userId,
      updatedAt: now,
    })
    .where(eq(PreNeedSurveyTable.id, surveyId))
    .returning();

  if (survey) {
    await createSurveyAuditLog({
      surveyId,
      actorType: "owner",
      actorId: userId,
      action: "locked",
    });
  }

  return survey ?? null;
}

/**
 * Unlock a survey
 */
export async function unlockSurvey({
  surveyId,
  userId,
}: {
  surveyId: string;
  userId: string;
}): Promise<typeof PreNeedSurveyTable.$inferSelect | null> {
  const now = new Date();

  const [survey] = await db
    .update(PreNeedSurveyTable)
    .set({
      isLocked: false,
      lockedAt: null,
      lockedBy: null,
      status: "shared",
      statusChangedAt: now,
      statusChangedBy: userId,
      updatedAt: now,
    })
    .where(eq(PreNeedSurveyTable.id, surveyId))
    .returning();

  if (survey) {
    await createSurveyAuditLog({
      surveyId,
      actorType: "owner",
      actorId: userId,
      action: "unlocked",
    });
  }

  return survey ?? null;
}

/**
 * Update survey progress tracking
 */
export async function updateSurveyProgress({
  surveyId,
  currentStep,
  completionPercentage,
}: {
  surveyId: string;
  currentStep?: number;
  completionPercentage?: number;
}): Promise<void> {
  const updates: Partial<PreNeedSurveyInsert> = {
    updatedAt: new Date(),
    lastClientAccessAt: new Date(),
  };

  if (currentStep !== undefined) updates.currentStep = currentStep;
  if (completionPercentage !== undefined)
    updates.completionPercentage = completionPercentage;

  await db
    .update(PreNeedSurveyTable)
    .set(updates)
    .where(eq(PreNeedSurveyTable.id, surveyId));
}

/**
 * Delete a survey and related data (cascades via FK)
 */
export async function deleteSurvey(
  surveyId: string
): Promise<typeof PreNeedSurveyTable.$inferSelect | null> {
  const [survey] = await db
    .delete(PreNeedSurveyTable)
    .where(eq(PreNeedSurveyTable.id, surveyId))
    .returning();

  return survey ?? null;
}

// ============================================================================
// Response Mutations
// ============================================================================

/**
 * Create or update a survey response (upsert)
 */
export async function upsertSurveyResponse({
  surveyId,
  responseData,
}: {
  surveyId: string;
  responseData: Partial<PreNeedSurveyResponseInsert>;
}): Promise<typeof PreNeedSurveyResponseTable.$inferSelect> {
  const now = new Date();

  // Check if response exists
  const [existing] = await db
    .select()
    .from(PreNeedSurveyResponseTable)
    .where(eq(PreNeedSurveyResponseTable.surveyId, surveyId))
    .limit(1);

  if (existing) {
    // Update existing response
    const [response] = await db
      .update(PreNeedSurveyResponseTable)
      .set({
        ...responseData,
        lastEditedAt: now,
        updatedAt: now,
      })
      .where(eq(PreNeedSurveyResponseTable.id, existing.id))
      .returning();

    // Log the update
    await createSurveyAuditLog({
      surveyId,
      actorType: "client",
      action: "response_saved",
    });

    return response;
  }
  // Create new response
  const [response] = await db
    .insert(PreNeedSurveyResponseTable)
    .values({
      surveyId,
      ...responseData,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return response;
}

/**
 * Mark a survey response as complete
 */
export async function completeSurveyResponse({
  surveyId,
  responseId,
}: {
  surveyId: string;
  responseId: string;
}): Promise<typeof PreNeedSurveyResponseTable.$inferSelect | null> {
  const now = new Date();

  const [response] = await db
    .update(PreNeedSurveyResponseTable)
    .set({
      isComplete: true,
      completedAt: now,
      updatedAt: now,
    })
    .where(eq(PreNeedSurveyResponseTable.id, responseId))
    .returning();

  if (response) {
    // Update survey status to submitted
    await db
      .update(PreNeedSurveyTable)
      .set({
        status: "submitted",
        statusChangedAt: now,
        completionPercentage: 100,
        updatedAt: now,
      })
      .where(eq(PreNeedSurveyTable.id, surveyId));

    await createSurveyAuditLog({
      surveyId,
      actorType: "client",
      action: "submitted",
    });
  }

  return response ?? null;
}

// ============================================================================
// Audit Log Mutations
// ============================================================================

/**
 * Create an audit log entry
 */
export async function createSurveyAuditLog({
  surveyId,
  actorType,
  actorId,
  actorName,
  action,
  previousStatus,
  newStatus,
  metadata,
}: {
  surveyId: string;
  actorType: "owner" | "client" | "org_admin" | "system";
  actorId?: string | null;
  actorName?: string | null;
  action:
    | "created"
    | "shared"
    | "response_saved"
    | "submitted"
    | "status_changed"
    | "locked"
    | "unlocked"
    | "approved"
    | "converted_to_entry";
  previousStatus?: SurveyStatus | null;
  newStatus?: SurveyStatus | null;
  metadata?: string | null;
}): Promise<void> {
  try {
    await db.insert(PreNeedSurveyAuditLogTable).values({
      surveyId,
      actorType,
      actorId: actorId ?? null,
      actorName: actorName ?? null,
      action,
      previousStatus: previousStatus ?? null,
      newStatus: newStatus ?? null,
      metadata: metadata ?? null,
      createdAt: new Date(),
    });
  } catch (error) {
    // Non-critical, log and continue
    console.error("Failed to create survey audit log:", error);
  }
}

// ============================================================================
// Share Link Mutations
// ============================================================================

/**
 * Increment survey share link view count
 */
export async function incrementSurveyViewCount(token: string): Promise<void> {
  try {
    const [shareLink] = await db
      .select()
      .from(ShareLinkTable)
      .where(eq(ShareLinkTable.token, token));

    if (shareLink) {
      await db
        .update(ShareLinkTable)
        .set({
          viewCount: (shareLink.viewCount ?? 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(ShareLinkTable.token, token));
    }
  } catch (error) {
    // Non-critical, log and continue
    console.error("Failed to increment survey view count:", error);
  }
}
