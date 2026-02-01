/**
 * Pre-Need Survey Status Type System
 *
 * Defines the type-safe status values for survey workflow tracking.
 */

/**
 * Valid status values for a pre-need survey
 *
 * Workflow progression:
 * draft → shared → submitted → under_review → approved → locked
 */
export const SURVEY_STATUSES = [
  "draft",
  "shared",
  "submitted",
  "under_review",
  "approved",
  "locked",
] as const;

/**
 * Survey status type derived from SURVEY_STATUSES array
 */
export type SurveyStatus = (typeof SURVEY_STATUSES)[number];

/**
 * Type guard to check if a value is a valid SurveyStatus
 */
export function isSurveyStatus(value: unknown): value is SurveyStatus {
  return (
    typeof value === "string" && SURVEY_STATUSES.includes(value as SurveyStatus)
  );
}

/**
 * Default status for new surveys
 */
export const DEFAULT_SURVEY_STATUS: SurveyStatus = "draft";

/**
 * Status configuration interface
 */
export interface SurveyStatusConfig {
  icon: string;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
  description?: string;
  /** Whether clients can edit the survey in this status */
  clientCanEdit: boolean;
  /** Whether owner can approve the survey in this status */
  canApprove: boolean;
}
