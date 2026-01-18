"use server";

import { models } from "@/lib/ai/models";
import { entryDetailTag } from "@/lib/cache";
import { db } from "@/lib/db";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import { EntryDetailsTable } from "@/lib/db/schema";
import { createStreamableValue } from "@ai-sdk/rsc";
import { auth } from "@clerk/nextjs/server";
import { smoothStream, streamText } from "ai";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Generate a ~100 word summary from an obituary document
 * Returns a streaming response for real-time display
 */
export async function generateObitSummaryAction(
  entryId: string,
  documentContent: string
) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Check permission to edit entry using standard pattern
  const access = await getEntryWithAccess(entryId);

  if (!access) {
    return { error: "Entry not found" };
  }

  if (!access.canEdit) {
    return { error: "You do not have permission to edit this entry" };
  }

  if (!documentContent || documentContent.length < 50) {
    return { error: "Obituary content is too short to summarize" };
  }

  try {
    const { textStream } = streamText({
      model: models.summarizer,
      system: `You are an expert obituary summarizer. Create concise, respectful summaries that capture the essence of a person's life.

REQUIREMENTS:
- Write approximately 100 words (80-120 words acceptable)
- Include: name, life dates, key relationships, notable accomplishments
- Written in third person, respectful tone
- Plain text only - no markdown, headers, or formatting
- Do not start with "This obituary..." - dive straight into the content
- Focus on what made this person special`,
      prompt: `Summarize this obituary in approximately 100 words:

${documentContent}`,
      experimental_transform: smoothStream({ chunking: "word" }),
    });

    return {
      success: true,
      result: createStreamableValue(textStream).value,
    };
  } catch (error) {
    console.error("[generateObitSummaryAction] Error:", error);
    return { error: "Failed to generate summary" };
  }
}

/**
 * Save the generated summary to entry details
 */
export async function saveObitSummaryAction(entryId: string, summary: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Check permission to edit entry using standard pattern
  const access = await getEntryWithAccess(entryId);

  if (!access) {
    return { error: "Entry not found" };
  }

  if (!access.canEdit) {
    return { error: "You do not have permission to edit this entry" };
  }

  if (!summary || summary.length < 10) {
    return { error: "Summary is too short" };
  }

  if (summary.length > 1000) {
    return { error: "Summary is too long" };
  }

  try {
    await db
      .insert(EntryDetailsTable)
      .values({
        entryId,
        generatedObitSummary: summary,
      })
      .onConflictDoUpdate({
        target: EntryDetailsTable.entryId,
        set: {
          generatedObitSummary: summary,
          updatedAt: new Date(),
        },
      });

    revalidateTag(entryDetailTag(entryId), "max");
    revalidatePath(`/${entryId}/images/create`);

    return { success: true };
  } catch (error) {
    console.error("[saveObitSummaryAction] Error:", error);
    return { error: "Failed to save summary" };
  }
}

/**
 * Delete the generated summary from entry details
 */
export async function deleteObitSummaryAction(entryId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Check permission to edit entry using standard pattern
  const access = await getEntryWithAccess(entryId);

  if (!access) {
    return { error: "Entry not found" };
  }

  if (!access.canEdit) {
    return { error: "You do not have permission to edit this entry" };
  }

  try {
    await db
      .update(EntryDetailsTable)
      .set({
        generatedObitSummary: null,
        updatedAt: new Date(),
      })
      .where(eq(EntryDetailsTable.entryId, entryId));

    revalidateTag(entryDetailTag(entryId), "max");
    revalidatePath(`/${entryId}/images/create`);

    return { success: true };
  } catch (error) {
    console.error("[deleteObitSummaryAction] Error:", error);
    return { error: "Failed to delete summary" };
  }
}
