"use server";

import {
    entryDetailTag,
    surveysByEntryTag,
    surveyTag,
} from "@/lib/cache";
import { db } from "@/lib/db";
import { createSurveyAuditLog } from "@/lib/db/mutations/pre-need-survey";
import { getEntryDetailsById } from "@/lib/db/queries/entries";
import {
    getLatestSurveyResponse,
    getSurveyWithAccess,
} from "@/lib/db/queries/pre-need-survey";
import { EntryDetailsTable } from "@/lib/db/schema";
import {
    getHarvestPreview,
    mapSurveyToEntryDetails,
    type HarvestFieldPreview,
    type SurveyFieldKey,
} from "@/lib/survey-to-entry-mapping";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";

type ActionState = {
  success?: boolean;
  error?: string;
};

type HarvestPreviewResult = ActionState & {
  preview?: HarvestFieldPreview[];
  entryId?: string;
};

type HarvestResult = ActionState & {
  fieldsUpdated?: number;
};

/**
 * Get a preview of fields that can be harvested from an approved survey
 */
export async function getHarvestPreviewAction(
  surveyId: string
): Promise<HarvestPreviewResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Get survey with access check
    const access = await getSurveyWithAccess(surveyId);
    if (!access?.canView) {
      return { error: "You don't have permission to view this survey" };
    }

    // Only allow harvesting from approved surveys
    if (access.survey.status !== "approved") {
      return { error: "Survey must be approved before harvesting data" };
    }

    // Get the latest response
    const response = await getLatestSurveyResponse(surveyId);
    if (!response) {
      return { error: "No survey response found" };
    }

    // Get existing entry details
    const existingDetails = await getEntryDetailsById(access.survey.entryId);

    // Generate preview
    const preview = getHarvestPreview(response, existingDetails ?? null);

    if (preview.length === 0) {
      return { error: "No harvestable fields found in the survey response" };
    }

    return {
      success: true,
      preview,
      entryId: access.survey.entryId,
    };
  } catch (error) {
    console.error("Error getting harvest preview:", error);
    return { error: "Failed to generate harvest preview" };
  }
}

/**
 * Harvest survey data to entry details
 * Allows selecting specific fields to harvest
 */
export async function harvestSurveyToEntryAction(
  surveyId: string,
  selectedFields?: SurveyFieldKey[]
): Promise<HarvestResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Get survey with access check
    const access = await getSurveyWithAccess(surveyId);
    if (!access?.canEdit) {
      return { error: "You don't have permission to harvest this survey" };
    }

    // Only allow harvesting from approved surveys
    if (access.survey.status !== "approved") {
      return { error: "Survey must be approved before harvesting data" };
    }

    // Get the latest response
    const response = await getLatestSurveyResponse(surveyId);
    if (!response) {
      return { error: "No survey response found" };
    }

    // Map survey response to entry details
    let mappedData = mapSurveyToEntryDetails(response);

    // Filter to selected fields if provided
    if (selectedFields && selectedFields.length > 0) {
      const existingDetails = await getEntryDetailsById(access.survey.entryId);
      const preview = getHarvestPreview(response, existingDetails ?? null);

      // Build filtered data from selected fields only
      const filteredData: Record<string, string> = {};
      for (const field of selectedFields) {
        const previewItem = preview.find((p) => p.surveyField === field);
        if (previewItem) {
          filteredData[previewItem.entryField] = previewItem.surveyValue;
        }
      }
      mappedData = filteredData;
    }

    // Count fields to update
    const fieldsToUpdate = Object.keys(mappedData).length;
    if (fieldsToUpdate === 0) {
      return { error: "No fields selected for harvest" };
    }

    // Upsert entry details
    await db
      .insert(EntryDetailsTable)
      .values({
        entryId: access.survey.entryId,
        ...mappedData,
      })
      .onConflictDoUpdate({
        target: EntryDetailsTable.entryId,
        set: {
          ...mappedData,
          updatedAt: new Date(),
        },
      });

    // Log the harvest event
    await createSurveyAuditLog({
      surveyId,
      actorType: access.role === "owner" ? "owner" : "org_admin",
      actorId: userId,
      action: "converted_to_entry",
      metadata: JSON.stringify({
        fieldsHarvested: Object.keys(mappedData),
        fieldsCount: fieldsToUpdate,
      }),
    });

    // Invalidate caches
    revalidateTag(surveyTag(surveyId), "max");
    revalidateTag(surveysByEntryTag(access.survey.entryId), "max");
    revalidateTag(entryDetailTag(access.survey.entryId), "max");

    return {
      success: true,
      fieldsUpdated: fieldsToUpdate,
    };
  } catch (error) {
    console.error("Error harvesting survey to entry:", error);
    return { error: "Failed to harvest survey data" };
  }
}
