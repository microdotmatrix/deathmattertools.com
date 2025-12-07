"use server";

import { deleteDocumentById } from "@/lib/db/mutations/documents";
import { revalidatePath } from "next/cache";

export async function deleteObituaryAction(
  obituaryId: string,
  entryId: string
): Promise<{ error: boolean; message?: string }> {
  const result = await deleteDocumentById(obituaryId);

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath(`/${entryId}`);
    return { error: false };
  }

  return { error: true, message: result.error };
}
