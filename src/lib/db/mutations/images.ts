"use server";

import { db } from "@/lib/db";
import { EntryTable, UserUploadTable } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * @deprecated This function is no longer used. Image uploads are now handled by
 * Uploadthing via the entryGalleryImage endpoint in uploadthing.ts.
 * The upload automatically saves to the database with proper validation.
 * 
 * See: src/lib/services/uploadthing.ts (entryGalleryImage)
 * Used in: src/components/sections/entries/entry-image-upload.tsx
 */
export const uploadEntryImage = async (
  entryId: string,
  fileUrl: string,
  storageKey: string,
  isPrimary: boolean = false
) => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Verify the user owns the entry
    const entry = await db
      .select()
      .from(EntryTable)
      .where(eq(EntryTable.id, entryId))
      .limit(1);

    if (entry.length === 0 || entry[0].userId !== userId) {
      return { error: "Entry not found or unauthorized" };
    }

    const imageId = crypto.randomUUID();

    await db.insert(UserUploadTable).values({
      id: imageId,
      userId,
      entryId,
      url: fileUrl,
      key: storageKey,
      isPrimary,
    });

    revalidatePath(`/dashboard/${entryId}`);
    return { success: true, imageId };
  } catch (error) {
    console.error("Failed to upload image:", error);
    return { error: "Failed to upload image" };
  }
};

export const deleteEntryImage = async (imageId: string, entryId: string) => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(UserUploadTable).where(eq(UserUploadTable.id, imageId));

    revalidatePath(`/dashboard/${entryId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return { error: "Failed to delete image" };
  }
};

