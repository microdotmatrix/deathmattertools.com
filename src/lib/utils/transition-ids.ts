/**
 * Transition ID utilities for shared element transitions
 * These are pure functions that can be called from both server and client components
 */

export type TransitionId =
  | "navigation-icon"
  | "navigation-title"
  | "navigation-pagination"
  | `entry-${string}-thumb`
  | `entry-${string}-name`;

/**
 * Generate a unique transition ID for entry thumbnails
 * Used for shared element transitions between dashboard and entry pages
 */
export const getEntryThumbnailId = (entryId: string): TransitionId =>
  `entry-${entryId}-thumb`;

/**
 * Generate a unique transition ID for entry names
 * Used for shared element transitions between dashboard and entry pages
 */
export const getEntryNameId = (entryId: string): TransitionId =>
  `entry-${entryId}-name`;
