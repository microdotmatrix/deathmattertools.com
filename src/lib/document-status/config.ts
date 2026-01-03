import type { DocumentStatus, StatusConfig } from "./types";

/**
 * Document Status Configuration
 *
 * Centralized configuration for status display with colors, icons, and labels.
 */
export const DOCUMENT_STATUS_CONFIG: Record<DocumentStatus, StatusConfig> = {
  draft: {
    icon: "mdi:file-document-edit-outline",
    label: "Draft",
    variant: "outline",
    className:
      "border-slate-300 bg-slate-100/80 text-slate-700 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
    description: "Document is being drafted",
  },
  awaiting_review: {
    icon: "mdi:clock-outline",
    label: "Awaiting Review",
    variant: "secondary",
    className:
      "border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400",
    description: "Document is ready for review",
  },
  needs_revisions: {
    icon: "mdi:pencil",
    label: "Needs Revisions",
    variant: "secondary",
    className:
      "border-orange-200 bg-orange-50/50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-400",
    description: "Document requires changes",
  },
  approved: {
    icon: "mdi:check-circle",
    label: "Approved",
    variant: "secondary",
    className:
      "border-green-200 bg-green-50/50 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-400",
    description: "Document has been approved",
  },
  published: {
    icon: "mdi:publish",
    label: "Published",
    variant: "default",
    className:
      "border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400",
    description: "Document has been published",
  },
} as const;

/**
 * Get status configuration by status value
 */
export function getStatusConfig(status: DocumentStatus): StatusConfig {
  return DOCUMENT_STATUS_CONFIG[status];
}

/**
 * Get all status options for dropdowns/selects
 */
export function getStatusOptions(): Array<{
  value: DocumentStatus;
  label: string;
  config: StatusConfig;
}> {
  return Object.entries(DOCUMENT_STATUS_CONFIG).map(([status, config]) => ({
    value: status as DocumentStatus,
    label: config.label,
    config,
  }));
}
