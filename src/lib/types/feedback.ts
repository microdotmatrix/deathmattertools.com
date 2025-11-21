export const FeedbackType = {
  CONTACT: "contact",
  FEATURE_REQUEST: "feature_request",
  BUG: "bug",
  OTHER: "other",
} as const;

export type FeedbackType = (typeof FeedbackType)[keyof typeof FeedbackType];

export const FeedbackStatus = {
  NEW: "new",
  IN_REVIEW: "in_review",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
} as const;

export type FeedbackStatus = (typeof FeedbackStatus)[keyof typeof FeedbackStatus];

export const FeedbackPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type FeedbackPriority = (typeof FeedbackPriority)[keyof typeof FeedbackPriority];

export const FeedbackSource = {
  CONTACT_PAGE: "contact_page",
  FEATURE_REQUEST_CARD: "feature_request_card",
  INLINE_SURVEY: "inline_survey",
} as const;

export type FeedbackSource = (typeof FeedbackSource)[keyof typeof FeedbackSource];

export interface Feedback {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  type: FeedbackType;
  source: FeedbackSource;
  userId?: string | null;
  entryId?: string | null;
  subject: string;
  message: string;
  status: FeedbackStatus;
  priority?: FeedbackPriority | null;
  metadata?: Record<string, unknown> | null;
  internalNotes?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    imageUrl: string | null;
  } | null;
}

