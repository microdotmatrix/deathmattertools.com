import type { EntryDetails, PreNeedSurveyResponse } from "@/lib/db/schema";

/**
 * Survey field to Entry field mapping configuration
 *
 * Maps survey response fields to entry details fields with labels for UI display.
 * Only includes fields that have meaningful mappings between the two schemas.
 */
export const SURVEY_TO_ENTRY_MAPPING = {
  // Personal identifiers
  preferredName: {
    target: "nickname" as const,
    label: "Nickname",
    category: "Personal",
  },

  // Work/Employment
  employerName: {
    target: "companyName" as const,
    label: "Company Name",
    category: "Employment",
  },

  // Religious/Spiritual
  religiousSpiritualNotes: {
    target: "denomination" as const,
    label: "Religious/Spiritual Notes",
    category: "Religious",
  },

  // Biography
  obituaryKeyPoints: {
    target: "biographicalSummary" as const,
    label: "Biographical Summary",
    category: "Biography",
  },

  // Donations
  preferredCharities: {
    target: "donationRequests" as const,
    label: "Donation Requests",
    category: "Service",
  },

  // Additional notes
  additionalInformation: {
    target: "additionalNotes" as const,
    label: "Additional Notes",
    category: "Other",
  },

  // Service details - map funeral arrangements
  funeralHomeProvider: {
    target: "serviceDetails" as const,
    label: "Service Details",
    category: "Service",
  },
} as const;

export type SurveyFieldKey = keyof typeof SURVEY_TO_ENTRY_MAPPING;
export type EntryFieldKey = (typeof SURVEY_TO_ENTRY_MAPPING)[SurveyFieldKey]["target"];

/**
 * Individual field preview for the harvest dialog
 */
export type HarvestFieldPreview = {
  surveyField: SurveyFieldKey;
  entryField: EntryFieldKey;
  label: string;
  category: string;
  surveyValue: string;
  existingValue: string | null;
  hasConflict: boolean;
};

/**
 * Maps survey response data to partial entry details
 */
export function mapSurveyToEntryDetails(
  response: PreNeedSurveyResponse
): Partial<EntryDetails> {
  const result: Partial<EntryDetails> = {};

  for (const [surveyKey, mapping] of Object.entries(SURVEY_TO_ENTRY_MAPPING)) {
    const value = response[surveyKey as SurveyFieldKey];
    if (value && typeof value === "string" && value.trim()) {
      (result as Record<string, string>)[mapping.target] = value.trim();
    }
  }

  return result;
}

/**
 * Generates a preview of fields that would be harvested
 * Shows survey values, existing entry values, and conflicts
 */
export function getHarvestPreview(
  response: PreNeedSurveyResponse,
  existingDetails: EntryDetails | null
): HarvestFieldPreview[] {
  const previews: HarvestFieldPreview[] = [];

  for (const [surveyKey, mapping] of Object.entries(SURVEY_TO_ENTRY_MAPPING)) {
    const surveyValue = response[surveyKey as SurveyFieldKey];

    if (surveyValue && typeof surveyValue === "string" && surveyValue.trim()) {
      const existingValue = existingDetails
        ? (existingDetails[mapping.target as keyof EntryDetails] as string | null)
        : null;

      previews.push({
        surveyField: surveyKey as SurveyFieldKey,
        entryField: mapping.target,
        label: mapping.label,
        category: mapping.category,
        surveyValue: surveyValue.trim(),
        existingValue: existingValue?.trim() || null,
        hasConflict: Boolean(existingValue?.trim()),
      });
    }
  }

  return previews;
}

/**
 * Filters harvest preview to only selected fields
 */
export function filterSelectedFields(
  preview: HarvestFieldPreview[],
  selectedFields: SurveyFieldKey[]
): HarvestFieldPreview[] {
  return preview.filter((item) => selectedFields.includes(item.surveyField));
}

/**
 * Groups harvest preview by category for UI display
 */
export function groupByCategory(
  preview: HarvestFieldPreview[]
): Record<string, HarvestFieldPreview[]> {
  return preview.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, HarvestFieldPreview[]>
  );
}
