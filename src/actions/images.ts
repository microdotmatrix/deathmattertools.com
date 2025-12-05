"use server";

import { entryImagesTag } from "@/lib/cache";
import { deleteImage as deleteImageMutation } from "@/lib/db/mutations";
import { revalidateTag } from "next/cache";

export async function deleteImageAction(imageId: string, entryId: string) {
  try {
    await deleteImageMutation(imageId);

    // Revalidate images cache with stale-while-revalidate
    revalidateTag(entryImagesTag(entryId), "max");

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { success: false, error: "Failed to delete image" };
  }
}
