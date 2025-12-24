/**
 * Document Status Type System
 *
 * Defines the type-safe status values for obituary/eulogy progress tracking.
 */

/**
 * Valid status values for a document (obituary/eulogy)
 *
 * Workflow progression:
 * draft → awaiting_review → needs_revisions → approved → published
 */
export const DOCUMENT_STATUSES = [
  "draft",
  "awaiting_review",
  "needs_revisions",
  "approved",
  "published",
] as const;

/**
 * Document status type derived from DOCUMENT_STATUSES array
 */
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

/**
 * Type guard to check if a value is a valid DocumentStatus
 */
export function isDocumentStatus(value: unknown): value is DocumentStatus {
  return (
    typeof value === "string" &&
    DOCUMENT_STATUSES.includes(value as DocumentStatus)
  );
}

/**
 * Default status for new documents
 */
export const DEFAULT_DOCUMENT_STATUS: DocumentStatus = "draft";

/**
 * Status configuration interface
 */
export interface StatusConfig {
  icon: string;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
  description?: string;
}
