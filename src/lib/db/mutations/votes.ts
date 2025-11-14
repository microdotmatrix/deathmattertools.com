"use server";

import { db } from "@/lib/db";
import { VoteTable } from "@/lib/db/schema/chat";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

/**
 * Create or update a vote for a message
 * Uses upsert logic to handle both new votes and vote changes
 */
export async function createOrUpdateVote(
  chatId: string,
  messageId: string,
  isUpvoted: boolean
) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized: You must be logged in to vote");
  }

  try {
    // Use insert with onConflictDoUpdate to handle upsert
    const [vote] = await db
      .insert(VoteTable)
      .values({
        chatId,
        messageId,
        isUpvoted,
      })
      .onConflictDoUpdate({
        target: [VoteTable.chatId, VoteTable.messageId],
        set: {
          isUpvoted,
        },
      })
      .returning();

    return vote;
  } catch (error) {
    console.error("Error creating/updating vote:", error);
    throw new Error("Failed to save vote");
  }
}

/**
 * Delete a vote for a message
 * Used when user wants to remove their vote
 */
export async function deleteVote(chatId: string, messageId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized: You must be logged in to delete votes");
  }

  try {
    await db
      .delete(VoteTable)
      .where(
        and(
          eq(VoteTable.chatId, chatId),
          eq(VoteTable.messageId, messageId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error deleting vote:", error);
    throw new Error("Failed to delete vote");
  }
}

/**
 * Get vote for a specific message
 * Returns the vote if it exists, null otherwise
 */
export async function getVoteByMessage(chatId: string, messageId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  try {
    const [vote] = await db
      .select()
      .from(VoteTable)
      .where(
        and(
          eq(VoteTable.chatId, chatId),
          eq(VoteTable.messageId, messageId)
        )
      )
      .limit(1);

    return vote || null;
  } catch (error) {
    console.error("Error fetching vote:", error);
    return null;
  }
}
