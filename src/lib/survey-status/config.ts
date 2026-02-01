import type { SurveyStatus, SurveyStatusConfig } from "./types";

/**
 * Pre-Need Survey Status Configuration
 *
 * Centralized configuration for status display with colors, icons, and labels.
 */
export const SURVEY_STATUS_CONFIG: Record<SurveyStatus, SurveyStatusConfig> = {
  draft: {
    icon: "mdi:file-document-edit-outline",
    label: "Draft",
    variant: "outline",
    className:
      "border-slate-300 bg-slate-100/80 text-slate-700 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
    description: "Survey created but not yet shared",
    clientCanEdit: false,
    canApprove: false,
  },
  shared: {
    icon: "mdi:share-variant",
    label: "Shared",
    variant: "secondary",
    className:
      "border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400",
    description: "Survey link has been shared with client",
    clientCanEdit: true,
    canApprove: false,
  },
  submitted: {
    icon: "mdi:send-check",
    label: "Submitted",
    variant: "secondary",
    className:
      "border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400",
    description: "Client has submitted the survey",
    clientCanEdit: true,
    canApprove: false,
  },
  under_review: {
    icon: "mdi:eye-outline",
    label: "Under Review",
    variant: "secondary",
    className:
      "border-purple-200 bg-purple-50/50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/50 dark:text-purple-400",
    description: "Owner is reviewing the submission",
    clientCanEdit: true,
    canApprove: true,
  },
  approved: {
    icon: "mdi:check-circle",
    label: "Approved",
    variant: "secondary",
    className:
      "border-green-200 bg-green-50/50 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-400",
    description: "Survey has been approved and data populated",
    clientCanEdit: false,
    canApprove: false,
  },
  locked: {
    icon: "mdi:lock",
    label: "Locked",
    variant: "default",
    className:
      "border-red-200 bg-red-50/50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400",
    description: "Survey is locked from further edits",
    clientCanEdit: false,
    canApprove: false,
  },
} as const;

/**
 * Get status configuration by status value
 */
export function getSurveyStatusConfig(status: SurveyStatus): SurveyStatusConfig {
  return SURVEY_STATUS_CONFIG[status];
}

/**
 * Get all status options for dropdowns/selects
 */
export function getSurveyStatusOptions(): Array<{
  value: SurveyStatus;
  label: string;
  config: SurveyStatusConfig;
}> {
  return Object.entries(SURVEY_STATUS_CONFIG).map(([status, config]) => ({
    value: status as SurveyStatus,
    label: config.label,
    config,
  }));
}

/**
 * Check if client can edit based on survey status
 */
export function canClientEdit(status: SurveyStatus): boolean {
  return SURVEY_STATUS_CONFIG[status].clientCanEdit;
}

/**
 * Check if survey can be approved based on status
 */
export function canApproveSurvey(status: SurveyStatus): boolean {
  return SURVEY_STATUS_CONFIG[status].canApprove;
}
