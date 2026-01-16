import "server-only";

import { db } from "@/lib/db";
import { PendingUploadTable } from "@/lib/db/schema";
import { and, eq, lt } from "drizzle-orm";

/**
 * Get all pending uploads that have expired (past TTL).
 * Used by cleanup cron job.
 * @param limit Maximum number of records to return (default 100)
 */
export async function getExpiredPendingUploads(limit = 100) {
  return db
    .select()
    .from(PendingUploadTable)
    .where(lt(PendingUploadTable.expiresAt, new Date()))
    .orderBy(PendingUploadTable.expiresAt)
    .limit(limit);
}

/**
 * Get pending upload by key.
 * @param key UploadThing file key
 */
export async function getPendingUploadByKey(key: string) {
  return db.query.PendingUploadTable.findFirst({
    where: eq(PendingUploadTable.key, key),
  });
}

/**
 * Get pending upload by user ID and key.
 * Used for client-side cleanup validation.
 * Returns null if upload doesn't exist or doesn't belong to the user.
 */
export async function getPendingUploadByUserAndKey(
  userId: string,
  key: string
) {
  return db.query.PendingUploadTable.findFirst({
    where: and(
      eq(PendingUploadTable.key, key),
      eq(PendingUploadTable.userId, userId)
    ),
  });
}
