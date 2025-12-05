/**
 * Cache utilities for Next.js 16 Cache Components
 *
 * This module provides tag helpers for use with the "use cache" directive
 * and cacheTag() function. The legacy unstable_cache wrapper is deprecated.
 *
 * @example
 * ```ts
 * import { cacheLife, cacheTag } from 'next/cache';
 * import { entryListTag } from '@/lib/cache';
 *
 * async function getEntries(userId: string) {
 *   'use cache'
 *   cacheLife('dashboard')
 *   cacheTag(entryListTag(userId))
 *   // ...fetch data
 * }
 * ```
 */

// ============================================================================
// Static Tags (for global/shared data)
// ============================================================================

export const TAGS = {
  userUploads: "userUploads",
  userGeneratedImages: "userGeneratedImages",
  userGeneratedEpitaphIds: "userGeneratedEpitaphIds",
  userSavedQuotes: "userSavedQuotes",
  userObituaries: "userObituaries",
  userObituariesDraft: "userObituariesDraft",
} as const;

// ============================================================================
// Dynamic Tag Helpers (for user/resource-specific data)
// ============================================================================

// Entry tags
export const entryListTag = (userId: string) => `entries:user:${userId}`;
export const entryDetailTag = (entryId: string) => `entries:${entryId}`;
export const orgEntriesTag = (orgId: string) => `entries:org:${orgId}`;

// Document tags
export const documentTag = (documentId: string) => `document:${documentId}`;
export const documentListTag = (userId: string) => `documents:user:${userId}`;
export const documentsByEntryTag = (entryId: string) =>
  `documents:entry:${entryId}`;
export const publicDocumentsTag = "documents:public";

// Comment tags
export const documentCommentsTag = (documentId: string) =>
  `document:${documentId}:comments`;

// Media tags
export const userImagesTag = (userId: string) => `images:user:${userId}`;
export const entryImagesTag = (entryId: string) => `images:entry:${entryId}`;
export const userGeneratedImagesTag = (userId: string, entryId: string) =>
  `images:generated:${userId}:${entryId}`;

// Uploads tags
export const userUploadsTag = (userId: string) => `uploads:user:${userId}`;
export const entryUploadsTag = (entryId: string) => `uploads:entry:${entryId}`;

// Feedback tags
export const entryFeedbackTag = (entryId: string) => `feedback:entry:${entryId}`;

// ============================================================================
// Cache Profile Types (matches next.config.ts cacheLife profiles)
// ============================================================================

/**
 * Available cache profiles defined in next.config.ts
 * - dashboard: Short cache for user-specific data (stale: 60s, revalidate: 30s)
 * - content: Moderate cache for documents/entries (stale: 5m, revalidate: 1m)
 * - realtime: Very short cache for comments (stale: 30s, revalidate: 15s)
 * - static: Long cache for semi-static content (stale: 1h, revalidate: 30m)
 */
export type CacheProfile = "dashboard" | "content" | "realtime" | "static";

// ============================================================================
// Legacy Support (deprecated)
// ============================================================================

import { unstable_cache as next_unstable_cache } from "next/cache";
import { cache as react_cache } from "react";

/**
 * @deprecated Use "use cache" directive with cacheLife() and cacheTag() instead
 *
 * Legacy cache wrapper that combines React's cache() with Next.js unstable_cache.
 * Kept for backward compatibility during migration.
 *
 * @example Migration:
 * ```ts
 * // Before (deprecated):
 * export const getEntries = cache(
 *   async (userId: string) => { ... },
 *   ['entries'],
 *   { revalidate: 60, tags: ['entries'] }
 * );
 *
 * // After (use cache directive):
 * export async function getEntries(userId: string) {
 *   'use cache'
 *   cacheLife('dashboard')
 *   cacheTag(entryListTag(userId))
 *   // ...
 * }
 * ```
 */
export const cache = <Inputs extends unknown[], Output>(
  callback: (...args: Inputs) => Promise<Output>,
  key: string[],
  options: { revalidate: number; tags: string[] }
) => react_cache(next_unstable_cache(callback, key, options));
