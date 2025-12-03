"use server";

import { db } from "@/lib/db";
import { UserSettingsTable } from "@/lib/db/schema/settings";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Theme is managed by next-themes cookie, not database
const UpdateSettingsSchema = z.object({
  notifications: z.boolean().default(true),
  cookies: z.boolean().default(false),
});

export async function updateUserSettings(prevState: { error?: string; success?: boolean }, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return { error: "User not authenticated" };
    }

    const validatedFields = UpdateSettingsSchema.safeParse({
      notifications: formData.get("notifications") === "on",
      cookies: formData.get("cookies") === "on",
    });

    if (!validatedFields.success) {
      return { error: "Invalid settings data" };
    }

    const { notifications, cookies } = validatedFields.data;

    await db
      .insert(UserSettingsTable)
      .values({
        userId: session.userId,
        notifications,
        cookies,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: UserSettingsTable.userId,
        set: {
          notifications,
          cookies,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user settings:", error);
    return { error: "Failed to update settings" };
  }
}
