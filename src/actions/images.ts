"use server";

import { deleteImage as deleteImageMutation } from "@/lib/db/mutations";
import { revalidatePath } from "next/cache";

export async function deleteImageAction(imageId: string, entryId: string) {
  try {
    await deleteImageMutation(imageId);
    
    // Revalidate the images page
    revalidatePath(`/${entryId}/images`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { success: false, error: "Failed to delete image" };
  }
}
