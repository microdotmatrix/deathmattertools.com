import "server-only";

import { db } from "@/lib/db";
import { UserSettingsTable } from "@/lib/db/schema/settings";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

// Theme is managed by next-themes cookie, not database
export async function getUserSettings() {
  const session = await auth();
  if (!session?.userId) {
    throw new Error("User not authenticated");
  }

  const settings = await db
    .select({
      userId: UserSettingsTable.userId,
      notifications: UserSettingsTable.notifications,
      cookies: UserSettingsTable.cookies,
    })
    .from(UserSettingsTable)
    .where(eq(UserSettingsTable.userId, session.userId))
    .limit(1);

  return settings[0] || {
    userId: session.userId,
    notifications: true,
    cookies: false,
  };
}

export type UserSettingsWithDefaults = Awaited<ReturnType<typeof getUserSettings>>;
