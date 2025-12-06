"use server";

import { savedQuotesByEntryTag } from "@/lib/cache";
import { db } from "@/lib/db";
import { SavedQuotesTable } from "@/lib/db/schema";
import { action } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

const SaveQuoteSchema = z.object({
  entryId: z.string(),
  quote: z.string().min(1).max(1000),
  citation: z.string().max(200).optional(),
  source: z.string().max(100),
  type: z.enum(["quote", "scripture", "axiom"]).default("quote"),
  faith: z.enum(["Christianity", "Islam"]).optional().nullable(),
  book: z.string().max(100).optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
  length: z.enum(["short", "medium", "long"]).default("medium"),
});

export const saveQuoteAction = action(SaveQuoteSchema, async (data) => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await db.insert(SavedQuotesTable).values({
      userId,
      entryId: data.entryId,
      quote: data.quote,
      citation: data.citation || null,
      source: data.source,
      type: data.type,
      faith: data.faith || null,
      book: data.book || null,
      reference: data.reference || null,
      length: data.length,
      usedInObituary: false,
      usedInImage: false,
    });

    // Revalidate cache tag for SWR behavior + path for immediate UI update
    revalidateTag(savedQuotesByEntryTag(data.entryId), "max");
    revalidatePath(`/${data.entryId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to save quote:", error);
    return { error: "Failed to save quote" };
  }
});

export const deleteQuoteAction = async (id: number, entryId: string) => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .delete(SavedQuotesTable)
      .where(
        and(
          eq(SavedQuotesTable.id, id),
          eq(SavedQuotesTable.userId, userId)
        )
      );

    // Revalidate cache tag for SWR behavior + path for immediate UI update
    revalidateTag(savedQuotesByEntryTag(entryId), "max");
    revalidatePath(`/${entryId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete quote:", error);
    return { error: "Failed to delete quote" };
  }
};

const UpdateQuoteUsageSchema = z.object({
  id: z.number(),
  usedInObituary: z.boolean().optional(),
  usedInImage: z.boolean().optional(),
});

export const updateQuoteUsageAction = action(
  UpdateQuoteUsageSchema,
  async (data) => {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    try {
      const updateData: Partial<typeof SavedQuotesTable.$inferInsert> = {};
      
      if (data.usedInObituary !== undefined) {
        updateData.usedInObituary = data.usedInObituary;
      }
      if (data.usedInImage !== undefined) {
        updateData.usedInImage = data.usedInImage;
      }

      await db
        .update(SavedQuotesTable)
        .set(updateData)
        .where(
          and(
            eq(SavedQuotesTable.id, data.id),
            eq(SavedQuotesTable.userId, userId)
          )
        );

      return { success: true };
    } catch (error) {
      console.error("Failed to update quote usage:", error);
      return { error: "Failed to update quote usage" };
    }
  }
);
