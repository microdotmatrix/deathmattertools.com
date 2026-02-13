"use server";

import {
    entryDetailTag,
    shareLinkTag,
    surveyResponseTag,
    surveysByEntryTag,
    surveysByOrgTag,
    surveysByUserTag,
    surveyTag,
} from "@/lib/cache";
import {
    completeSurveyResponse,
    createPreNeedSurvey,
    createSurveyAuditLog,
    deleteSurvey,
    incrementSurveyViewCount,
    lockSurvey,
    unlockSurvey,
    updateSurveyProgress,
    updateSurveyStatus,
    upsertSurveyResponse,
} from "@/lib/db/mutations/pre-need-survey";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import {
    getLatestSurveyResponse,
    getSurveyByShareToken,
    getSurveysByEntryId,
    getSurveyWithAccess,
} from "@/lib/db/queries/pre-need-survey";
import type { SurveyStatus } from "@/lib/db/schema";
import { env } from "@/lib/env/server";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

type ActionState = {
  success?: boolean;
  error?: string;
};

type CreateSurveyState = ActionState & {
  surveyId?: string;
  shareToken?: string;
  shareUrl?: string;
};

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateSurveySchema = z.object({
  entryId: z.string().uuid("Entry ID is required"),
  title: z.string().max(200).optional(),
  clientName: z.string().max(200).optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientRelationship: z.string().max(100).optional(),
  password: z.string().min(4).max(50).optional().or(z.literal("")),
  expiresInDays: z.coerce.number().int().min(0).max(365).optional(),
});

// Survey response validation - all fields optional
const SurveyResponseSchema = z.object({
  // Section 1: Basic Access
  fullName: z.string().max(200).optional(),
  preferredName: z.string().max(100).optional(),
  needsAccessCodes: z.boolean().optional(),
  phoneDeviceHint: z.string().max(500).optional(),
  passwordManagerHint: z.string().max(500).optional(),
  accessDetailsLocation: z.string().max(500).optional(),

  // Section 2: Key Contacts
  emergencyContactName: z.string().max(200).optional(),
  emergencyContactRelationship: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(50).optional(),
  emergencyContactNotes: z.string().max(1000).optional(),
  hasAttorney: z.boolean().optional(),
  attorneyName: z.string().max(200).optional(),
  attorneyPhone: z.string().max(50).optional(),
  hasFinancialAdvisor: z.boolean().optional(),
  financialAdvisorName: z.string().max(200).optional(),
  financialAdvisorPhone: z.string().max(50).optional(),

  // Section 3: Documents
  hasWill: z.enum(["yes", "no", "unsure"]).optional(),
  willLocation: z.string().max(500).optional(),
  willAttorneyName: z.string().max(200).optional(),
  hasPowerOfAttorneyFinancial: z.boolean().optional(),
  hasPowerOfAttorneyHealthcare: z.boolean().optional(),
  hasLivingWill: z.boolean().optional(),
  hasHealthCareProxy: z.boolean().optional(),
  legalDocsDesignatedPerson: z.string().max(200).optional(),
  legalDocsDesignatedPhone: z.string().max(50).optional(),
  legalDocsLocation: z.string().max(500).optional(),

  // Section 4: Financial
  hasEndOfLifeFunding: z.boolean().optional(),
  fundingLocation: z.string().max(500).optional(),
  isPreneedPlan: z.boolean().optional(),
  hasLifeInsurance: z.boolean().optional(),
  lifeInsuranceCompany: z.string().max(200).optional(),
  lifeInsurancePolicyLocation: z.string().max(500).optional(),
  lifeInsuranceBeneficiary: z.string().max(200).optional(),
  banksCreditUnions: z.string().max(500).optional(),
  investmentAccounts: z.string().max(500).optional(),
  otherFinancialAccounts: z.string().max(500).optional(),
  accountDetailsLocation: z.string().max(500).optional(),

  // Section 5: Property
  ownsOrRentsProperty: z.boolean().optional(),
  propertyAddress: z.string().max(500).optional(),
  propertyStatus: z.enum(["own", "rent", "lease"]).optional(),
  propertyContacts: z.string().max(500).optional(),
  propertyDocsLocation: z.string().max(500).optional(),
  hasStorageUnit: z.boolean().optional(),
  hasSafeDepositBox: z.boolean().optional(),
  hasPOBox: z.boolean().optional(),
  hasVehicles: z.boolean().optional(),
  otherAssetsDetails: z.string().max(1000).optional(),
  otherAssetsAccessInfo: z.string().max(500).optional(),

  // Section 6: Digital Life
  usesPasswordManager: z.boolean().optional(),
  passwordManagerName: z.string().max(100).optional(),
  masterPasswordLocation: z.string().max(500).optional(),
  hasEmailAccounts: z.boolean().optional(),
  hasSocialMedia: z.boolean().optional(),
  hasBankingApps: z.boolean().optional(),
  hasStreamingSubscriptions: z.boolean().optional(),
  hasWorkAccounts: z.boolean().optional(),
  hasCloudStorage: z.boolean().optional(),
  loginInfoLocation: z.string().max(500).optional(),
  accountsToDelete: z.string().max(1000).optional(),
  accountsToMemorialize: z.string().max(1000).optional(),

  // Section 7: Ongoing Responsibilities
  hasUtilityPayments: z.boolean().optional(),
  hasSubscriptionPayments: z.boolean().optional(),
  hasInsurancePayments: z.boolean().optional(),
  hasCharitableDonations: z.boolean().optional(),
  paymentMethod: z.string().max(500).optional(),

  // Section 8: Healthcare
  primaryDoctorName: z.string().max(200).optional(),
  primaryDoctorPhone: z.string().max(50).optional(),
  criticalMedications: z.string().max(1000).optional(),
  majorHealthConditions: z.string().max(1000).optional(),
  preferredHospital: z.string().max(200).optional(),
  organDonationPreference: z.enum(["yes", "no", "family_decides"]).optional(),

  // Section 9: End-of-Life
  hasFuneralArrangements: z.boolean().optional(),
  funeralHomeProvider: z.string().max(200).optional(),
  arrangementPaperworkLocation: z.string().max(500).optional(),
  serviceTypePreference: z
    .enum(["funeral", "memorial", "celebration", "private", "no_preference"])
    .optional(),
  finalArrangementPreference: z
    .enum(["burial", "cremation", "green_burial", "no_preference"])
    .optional(),
  religiousSpiritualNotes: z.string().max(1000).optional(),
  obituaryKeyPoints: z.string().max(2000).optional(),
  preferredCharities: z.string().max(1000).optional(),

  // Section 10: Special Items
  hasSpecificItemsForPeople: z.boolean().optional(),
  specificItemsDocLocation: z.string().max(500).optional(),
  personToNotify1Name: z.string().max(200).optional(),
  personToNotify1Relationship: z.string().max(100).optional(),
  personToNotify1Contact: z.string().max(200).optional(),
  personToNotify2Name: z.string().max(200).optional(),
  personToNotify2Relationship: z.string().max(100).optional(),
  personToNotify2Contact: z.string().max(200).optional(),
  employerName: z.string().max(200).optional(),
  hrBenefitsContact: z.string().max(200).optional(),

  // Section 11: Final Details
  spareKeysLocation: z.string().max(500).optional(),
  carKeysLocation: z.string().max(500).optional(),
  safeSecurityCodeHint: z.string().max(500).optional(),
  additionalInformation: z.string().max(5000).optional(),
  backupPerson1: z.string().max(200).optional(),
  backupPerson2: z.string().max(200).optional(),
  backupLocation: z.string().max(500).optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

function buildSurveyShareUrl(token: string): string {
  return `${env.BASE_URL}/survey/${token}`;
}

function calculateExpiresAt(days: number | undefined): Date | null {
  if (!days || days <= 0) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function calculateCompletionPercentage(
  data: Record<string, unknown>
): number {
  const totalFields = Object.keys(SurveyResponseSchema.shape).length;
  const filledFields = Object.values(data).filter(
    (v) => v !== undefined && v !== null && v !== ""
  ).length;
  return Math.round((filledFields / totalFields) * 100);
}

// ============================================================================
// Survey Management Actions (Owner)
// ============================================================================

/**
 * Create a new pre-need survey for an entry
 */
export async function createSurveyAction(
  _prevState: CreateSurveyState,
  formData: FormData
): Promise<CreateSurveyState> {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Parse form data
    const rawData = {
      entryId: formData.get("entryId") as string,
      title: formData.get("title") as string,
      clientName: formData.get("clientName") as string,
      clientEmail: formData.get("clientEmail") as string,
      clientRelationship: formData.get("clientRelationship") as string,
      password: formData.get("password") as string,
      expiresInDays: formData.get("expiresInDays") as string,
    };

    const parsed = CreateSurveySchema.safeParse({
      ...rawData,
      expiresInDays: rawData.expiresInDays
        ? Number.parseInt(rawData.expiresInDays, 10)
        : undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const entryId = parsed.data.entryId;

    // Verify access to entry
    const entryAccess = await getEntryWithAccess(entryId);
    if (!entryAccess?.canEdit) {
      return { error: "You don't have permission to create a survey for this entry" };
    }

    const { survey, shareToken } = await createPreNeedSurvey({
      userId,
      organizationId: orgId ?? null,
      entryId,
      title: parsed.data.title,
      clientName: parsed.data.clientName || null,
      clientEmail: parsed.data.clientEmail || null,
      clientRelationship: parsed.data.clientRelationship || null,
      password: parsed.data.password || null,
      expiresAt: calculateExpiresAt(parsed.data.expiresInDays),
    });

    // Invalidate caches
    revalidateTag(surveysByUserTag(userId));
    revalidateTag(surveysByEntryTag(entryId));
    if (orgId) revalidateTag(surveysByOrgTag(orgId));

    return {
      success: true,
      surveyId: survey.id,
      shareToken,
      shareUrl: buildSurveyShareUrl(shareToken),
    };
  } catch (error) {
    console.error("Error creating survey:", error);
    return { error: "Failed to create survey" };
  }
}

/**
 * Update survey status
 */
export async function updateSurveyStatusAction(
  surveyId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const status = formData.get("status") as SurveyStatus;
    if (!status) {
      return { error: "Status is required" };
    }

    const access = await getSurveyWithAccess(surveyId);
    if (!access?.canEdit) {
      return { error: "You don't have permission to update this survey" };
    }

    await updateSurveyStatus({ surveyId, status, userId });

    // Invalidate caches
    revalidateTag(surveyTag(surveyId));
    revalidateTag(surveysByUserTag(access.survey.userId));
    if (access.survey.organizationId) {
      revalidateTag(surveysByOrgTag(access.survey.organizationId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating survey status:", error);
    return { error: "Failed to update survey status" };
  }
}

/**
 * Lock a survey (prevents client edits)
 */
export async function lockSurveyAction(
  surveyId: string,
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const access = await getSurveyWithAccess(surveyId);
    if (!access?.canLock) {
      return { error: "You don't have permission to lock this survey" };
    }

    await lockSurvey({ surveyId, userId });

    revalidateTag(surveyTag(surveyId));

    return { success: true };
  } catch (error) {
    console.error("Error locking survey:", error);
    return { error: "Failed to lock survey" };
  }
}

/**
 * Unlock a survey (allows client edits)
 */
export async function unlockSurveyAction(
  surveyId: string,
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const access = await getSurveyWithAccess(surveyId);
    if (!access?.canLock) {
      return { error: "You don't have permission to unlock this survey" };
    }

    await unlockSurvey({ surveyId, userId });

    revalidateTag(surveyTag(surveyId));

    return { success: true };
  } catch (error) {
    console.error("Error unlocking survey:", error);
    return { error: "Failed to unlock survey" };
  }
}

/**
 * Delete a survey
 */
export async function deleteSurveyAction(
  surveyId: string,
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const access = await getSurveyWithAccess(surveyId);
    if (!access || access.role !== "owner") {
      return { error: "Only the survey owner can delete it" };
    }

    await deleteSurvey(surveyId);

    revalidateTag(surveyTag(surveyId));
    revalidateTag(surveysByUserTag(access.survey.userId));
    revalidateTag(surveysByEntryTag(access.survey.entryId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting survey:", error);
    return { error: "Failed to delete survey" };
  }
}

// ============================================================================
// Survey Response Actions (Client via Share Link)
// ============================================================================

/**
 * Save survey progress (auto-save or manual save)
 */
export async function saveSurveyProgressAction(
  token: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Get survey by token (no auth required)
    const data = await getSurveyByShareToken(token);

    if (!data) {
      return { error: "Survey not found or expired" };
    }

    if (!data.canEdit) {
      return { error: "This survey is locked and cannot be edited" };
    }

    // Parse response data from form
    const rawData: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "currentStep") continue;
      // Handle checkbox/boolean values
      if (value === "true") rawData[key] = true;
      else if (value === "false") rawData[key] = false;
      else if (value === "") rawData[key] = undefined;
      else rawData[key] = value;
    }

    const parsed = SurveyResponseSchema.safeParse(rawData);

    if (!parsed.success) {
      return { error: "Invalid form data" };
    }

    // Calculate completion percentage
    const completionPercentage = calculateCompletionPercentage(parsed.data);
    const currentStep = formData.get("currentStep");

    // Upsert response
    await upsertSurveyResponse({
      surveyId: data.survey.id,
      responseData: parsed.data,
    });

    // Update progress
    await updateSurveyProgress({
      surveyId: data.survey.id,
      currentStep: currentStep ? Number.parseInt(currentStep as string, 10) : undefined,
      completionPercentage,
    });

    // Invalidate caches
    revalidateTag(surveyTag(data.survey.id));
    revalidateTag(surveyResponseTag(data.survey.id));
    revalidateTag(shareLinkTag(token));

    return { success: true };
  } catch (error) {
    console.error("Error saving survey progress:", error);
    return { error: "Failed to save progress" };
  }
}

/**
 * Submit completed survey
 */
export async function submitSurveyAction(
  token: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Get survey by token
    const data = await getSurveyByShareToken(token);

    if (!data) {
      return { error: "Survey not found or expired" };
    }

    if (!data.canEdit) {
      return { error: "This survey is locked and cannot be submitted" };
    }

    // First save the final data
    const saveResult = await saveSurveyProgressAction(token, {}, formData);
    if (saveResult.error) {
      return saveResult;
    }

    // Get the response to mark as complete
    const response = await getLatestSurveyResponse(data.survey.id);
    if (!response) {
      return { error: "No response found to submit" };
    }

    // Complete the response
    await completeSurveyResponse({
      surveyId: data.survey.id,
      responseId: response.id,
    });

    // Invalidate caches
    revalidateTag(surveyTag(data.survey.id));
    revalidateTag(surveyResponseTag(data.survey.id));
    revalidateTag(shareLinkTag(token));
    revalidateTag(surveysByUserTag(data.survey.userId));
    if (data.survey.organizationId) {
      revalidateTag(surveysByOrgTag(data.survey.organizationId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting survey:", error);
    return { error: "Failed to submit survey" };
  }
}

/**
 * Track survey view (increment view count)
 */
export async function trackSurveyViewAction(token: string): Promise<void> {
  try {
    await incrementSurveyViewCount(token);
  } catch (error) {
    // Non-critical, just log
    console.error("Error tracking survey view:", error);
  }
}

// ============================================================================
// Approval and Entry Population Actions
// ============================================================================

/**
 * Approve survey and populate entry fields
 */
export async function approveSurveyAction(
  surveyId: string,
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState & { entryId?: string }> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const access = await getSurveyWithAccess(surveyId);
    if (!access?.canApprove) {
      return { error: "You don't have permission to approve this survey" };
    }

    const response = await getLatestSurveyResponse(surveyId);
    if (!response) {
      return { error: "No response found to approve" };
    }

    // Update status to approved
    await updateSurveyStatus({ surveyId, status: "approved", userId });

    // Lock the survey
    await lockSurvey({ surveyId, userId });

    // Log approval
    await createSurveyAuditLog({
      surveyId,
      actorType: access.role === "owner" ? "owner" : "org_admin",
      actorId: userId,
      action: "approved",
    });

    // Invalidate caches
    revalidateTag(surveyTag(surveyId));
    revalidateTag(surveysByUserTag(access.survey.userId));
    revalidateTag(entryDetailTag(access.survey.entryId));

    return { success: true, entryId: access.survey.entryId };
  } catch (error) {
    console.error("Error approving survey:", error);
    return { error: "Failed to approve survey" };
  }
}

// ============================================================================
// Owner Mode Actions (Authenticated users filling their own survey)
// ============================================================================

type CreateOrGetSurveyResult = ActionState & {
  survey?: {
    id: string;
    status: SurveyStatus;
    currentStep: number | null;
  };
};

/**
 * Create or get an existing survey for an entry (owner mode)
 * Used when entry owner wants to fill the survey directly
 */
export async function createOrGetEntrySurveyAction(
  entryId: string
): Promise<CreateOrGetSurveyResult> {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Verify access to entry
    const entryAccess = await getEntryWithAccess(entryId);
    if (!entryAccess?.canEdit) {
      return { error: "You don't have permission to access this entry" };
    }

    // Check if survey already exists for this entry
    const existingSurveys = await getSurveysByEntryId(entryId);
    
    if (existingSurveys.length > 0) {
      const survey = existingSurveys[0];
      return {
        success: true,
        survey: {
          id: survey.id,
          status: survey.status,
          currentStep: survey.currentStep,
        },
      };
    }

    // Create a new survey for owner mode (no share link needed initially)
    const { survey } = await createPreNeedSurvey({
      userId,
      organizationId: orgId ?? null,
      entryId,
      title: `Survey for ${entryAccess.entry.name}`,
      clientName: null,
      clientEmail: null,
      clientRelationship: "Self/Owner",
      password: null,
      expiresAt: null,
    });

    // Invalidate caches
    revalidateTag(surveysByUserTag(userId));
    revalidateTag(surveysByEntryTag(entryId));
    if (orgId) revalidateTag(surveysByOrgTag(orgId));

    return {
      success: true,
      survey: {
        id: survey.id,
        status: survey.status,
        currentStep: survey.currentStep,
      },
    };
  } catch (error) {
    console.error("Error creating/getting survey:", error);
    return { error: "Failed to create or retrieve survey" };
  }
}

/**
 * Save survey progress for owner mode (authenticated)
 */
export async function saveOwnerSurveyProgressAction(
  surveyId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Verify owner access to survey
    const access = await getSurveyWithAccess(surveyId);
    if (!access?.canEdit) {
      return { error: "You don't have permission to edit this survey" };
    }

    if (access.survey.isLocked) {
      return { error: "This survey is locked and cannot be edited" };
    }

    // Parse response data from form
    const rawData: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "currentStep") continue;
      if (value === "true") rawData[key] = true;
      else if (value === "false") rawData[key] = false;
      else if (value === "") rawData[key] = undefined;
      else rawData[key] = value;
    }

    const parsed = SurveyResponseSchema.safeParse(rawData);

    if (!parsed.success) {
      return { error: "Invalid form data" };
    }

    // Calculate completion percentage
    const completionPercentage = calculateCompletionPercentage(parsed.data);
    const currentStep = formData.get("currentStep");

    // Upsert response
    await upsertSurveyResponse({
      surveyId,
      responseData: parsed.data,
    });

    // Update progress
    await updateSurveyProgress({
      surveyId,
      currentStep: currentStep ? Number.parseInt(currentStep as string, 10) : undefined,
      completionPercentage,
    });

    // Invalidate caches
    revalidateTag(surveyTag(surveyId));
    revalidateTag(surveyResponseTag(surveyId));

    return { success: true };
  } catch (error) {
    console.error("Error saving owner survey progress:", error);
    return { error: "Failed to save progress" };
  }
}

/**
 * Submit and auto-approve survey for owner mode
 */
export async function submitOwnerSurveyAction(
  surveyId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Verify owner access
    const access = await getSurveyWithAccess(surveyId);
    if (!access?.canEdit) {
      return { error: "You don't have permission to submit this survey" };
    }

    // First save the final data
    const saveResult = await saveOwnerSurveyProgressAction(surveyId, {}, formData);
    if (saveResult.error) {
      return saveResult;
    }

    // Get the response to mark as complete
    const response = await getLatestSurveyResponse(surveyId);
    if (!response) {
      return { error: "No response found to submit" };
    }

    // Complete the response
    await completeSurveyResponse({
      surveyId,
      responseId: response.id,
    });

    // Auto-approve since owner is filling
    await updateSurveyStatus({ surveyId, status: "approved", userId });

    // Lock the survey
    await lockSurvey({ surveyId, userId });

    // Log approval
    await createSurveyAuditLog({
      surveyId,
      actorType: "owner",
      actorId: userId,
      action: "approved",
    });

    // Invalidate caches
    revalidateTag(surveyTag(surveyId));
    revalidateTag(surveyResponseTag(surveyId));
    revalidateTag(surveysByUserTag(access.survey.userId));
    revalidateTag(entryDetailTag(access.survey.entryId));
    if (access.survey.organizationId) {
      revalidateTag(surveysByOrgTag(access.survey.organizationId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting owner survey:", error);
    return { error: "Failed to submit survey" };
  }
}

// ============================================================================
// Public Access Actions
// ============================================================================

/**
 * Verify password for protected survey
 */
export async function verifySurveyPasswordAction(
  token: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { compare } = await import("bcryptjs");

    const password = formData.get("password") as string;
    if (!password) {
      return { error: "Password is required" };
    }

    // Get share link
    const data = await getSurveyByShareToken(token);

    if (!data) {
      return { error: "Survey not found or expired" };
    }

    // Check if password protected
    if (!data.shareLink.passwordHash) {
      return { success: true }; // No password required
    }

    // Verify password
    const isValid = await compare(password, data.shareLink.passwordHash);

    if (!isValid) {
      return { error: "Incorrect password" };
    }

    // Set a cookie to remember verification
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set(`survey-verified-${token}`, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return { success: true };
  } catch (error) {
    console.error("Error verifying survey password:", error);
    return { error: "Failed to verify password" };
  }
}
