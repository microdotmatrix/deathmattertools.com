"use server";

import { db } from "@/lib/db";
import { PendingUploadTable } from "@/lib/db/schema";
import { getPendingUploadByUserAndKey } from "@/lib/db/queries/pending-uploads";
import { utapi } from "@/lib/services/uploadthing";
import { auth } from "@clerk/nextjs/server";
import { eq, inArray } from "drizzle-orm";

/**
 * Delete pending uploads from both DB and UploadThing CDN.
 * Used by the cleanup cron job.
 * @param keys Array of UploadThing file keys to delete
 * @returns Count of successfully deleted records
 */
export async function deletePendingUploads(keys: string[]) {
  if (keys.length === 0) return 0;

  try {
    // Delete from UploadThing CDN (batch)
    await utapi.deleteFiles(keys);

    // Delete from database
    const result = await db
      .delete(PendingUploadTable)
      .where(inArray(PendingUploadTable.key, keys))
      .returning({ deletedId: PendingUploadTable.id });

    console.log(`[Cleanup] Deleted ${result.length} pending uploads from DB/CDN`);
    return result.length;
  } catch (error) {
    console.error("[Cleanup] Error deleting pending uploads:", error);
    throw error;
  }
}

/**
 * Delete a single pending upload by key.
 * Used for client-side cleanup on form cancel/unmount.
 * Requires authentication - user can only delete their own pending uploads.
 * @param key UploadThing file key
 */
export async function deletePendingUploadByKey(key: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Use query layer to verify ownership
    const upload = await getPendingUploadByUserAndKey(userId, key);

    if (!upload) {
      // Already deleted, doesn't exist, or doesn't belong to user
      return { success: true, deleted: false };
    }

    // Delete from UploadThing CDN
    await utapi.deleteFiles([key]);

    // Delete from database
    await db
      .delete(PendingUploadTable)
      .where(eq(PendingUploadTable.key, key));

    console.log(`[Cleanup] User ${userId} deleted pending upload: ${key}`);
    return { success: true, deleted: true };
  } catch (error) {
    console.error("[Cleanup] Error deleting pending upload:", error);
    return { error: "Failed to delete upload" };
  }
}

/**
 * Create a pending upload record.
 * Called from UploadThing onUploadComplete callback.
 * @param data Pending upload data
 */
export async function createPendingUpload(data: {
  userId: string;
  key: string;
  url: string;
  uploadType: "entry_profile" | "entry_gallery";
  ttlHours?: number;
}) {
  const ttlHours = data.ttlHours ?? 2;
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  await db.insert(PendingUploadTable).values({
    id: crypto.randomUUID(),
    userId: data.userId,
    key: data.key,
    url: data.url,
    uploadType: data.uploadType,
    expiresAt,
  });
}

/**
 * Delete a pending upload record by key (database only, no CDN deletion).
 * Used when an upload is "claimed" by an entry creation.
 * @param key UploadThing file key
 */
export async function claimPendingUpload(key: string) {
  await db
    .delete(PendingUploadTable)
    .where(eq(PendingUploadTable.key, key));
}
