"use server";

import { TAGS } from "@/lib/cache";
import { db } from "@/lib/db";
import { UserGeneratedImageTable } from "@/lib/db/schema";
import {
  fetchTemplates,
  generateImage,
  generateBookmark,
  generatePrayerCardFront,
  generatePrayerCardBack,
  generateSinglePageMemorial,
  templateIds,
  type PlacidRequest,
  type PlacidCardRequest,
} from "@/lib/services/placid";
import type { ActionState } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export type MemorialTemplateKey =
  | "bookmark"
  | "prayerCard"
  | "singlePageMemorial";

export async function createEpitaphs(
  formData: PlacidRequest,
  entryId: string,
): Promise<ActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "User not authenticated" };
  }

  try {
    const templates = await fetchTemplates();
    const variables = {
      portrait: formData.portrait.toString(),
      name: formData.name.toString(),
      epitaph: formData.epitaph.toString(),
      citation: formData.citation.toString(),
      birth: formData.birth.toString(),
      death: formData.death.toString(),
    };

    const epitaphs = templates.data.map((template) => {
      return generateImage({
        templateId: template.uuid,
        variables: variables,
      });
    });

    const results = await Promise.allSettled(epitaphs);

    const successfulResults = results.filter(
      (result) => result.status === "fulfilled",
    );

    const epitaphIds = successfulResults.map((result) => {
      if (result.status === "fulfilled") {
        return result.value.id;
      }
      return null;
    });

    console.log("Successful results", successfulResults);
    console.log("Epitaph IDs", epitaphIds);

    const dbInsertPromises = successfulResults.map((result, index) => {
      if (result.status === "fulfilled") {
        const template = templates.data[index];
        return db.insert(UserGeneratedImageTable).values({
          id: crypto.randomUUID(),
          userId: userId,
          entryId: entryId,
          epitaphId: result.value.id,
          templateId: template.uuid,
          metadata: {
            variables: variables,
            templateName: template.title || "Unknown template",
            generatedAt: new Date().toISOString(),
          },
        });
      }
      return Promise.resolve();
    });

    await Promise.all(dbInsertPromises.filter(Boolean));

    return { result: epitaphIds.filter((id) => id !== null) as number[] };
  } catch (error) {
    console.error("Error creating epitaphs:", error);
    return { error: "Failed to create epitaphs" };
  }
}

export async function createMemorialImage(
  formData: PlacidCardRequest,
  templateKey: MemorialTemplateKey,
  entryId: string,
): Promise<ActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "User not authenticated" };
  }

  try {
    const imageIds: number[] = [];

    if (templateKey === "bookmark") {
      const result = await generateBookmark({
        variables: formData,
        templateId: templateIds.bookmark,
      });

      if (!result?.id) {
        throw new Error("Failed to generate bookmark image");
      }

      await db.insert(UserGeneratedImageTable).values({
        id: crypto.randomUUID(),
        userId: userId,
        entryId: entryId,
        epitaphId: result.id,
        templateId: templateIds.bookmark,
        metadata: {
          variables: formData,
          templateName: "Bookmark",
          generatedAt: new Date().toISOString(),
        },
      });

      imageIds.push(result.id);
    } else if (templateKey === "prayerCard") {
      const [frontResult, backResult] = await Promise.all([
        generatePrayerCardFront({
          variables: formData,
          templateId: templateIds.prayerCardFront,
        }),
        generatePrayerCardBack({
          variables: formData,
          templateId: templateIds.prayerCardBack,
        }),
      ]);

      if (!frontResult?.id || !backResult?.id) {
        throw new Error("Failed to generate prayer card images");
      }

      await Promise.all([
        db.insert(UserGeneratedImageTable).values({
          id: crypto.randomUUID(),
          userId: userId,
          entryId: entryId,
          epitaphId: frontResult.id,
          templateId: templateIds.prayerCardFront,
          metadata: {
            variables: formData,
            templateName: "Prayer Card (Front)",
            generatedAt: new Date().toISOString(),
          },
        }),
        db.insert(UserGeneratedImageTable).values({
          id: crypto.randomUUID(),
          userId: userId,
          entryId: entryId,
          epitaphId: backResult.id,
          templateId: templateIds.prayerCardBack,
          metadata: {
            variables: formData,
            templateName: "Prayer Card (Back)",
            generatedAt: new Date().toISOString(),
          },
        }),
      ]);

      imageIds.push(frontResult.id, backResult.id);
    } else if (templateKey === "singlePageMemorial") {
      const result = await generateSinglePageMemorial({
        variables: formData,
        templateId: templateIds.singlePageMemorial,
      });

      if (!result?.id) {
        throw new Error("Failed to generate single page memorial image");
      }

      await db.insert(UserGeneratedImageTable).values({
        id: crypto.randomUUID(),
        userId: userId,
        entryId: entryId,
        epitaphId: result.id,
        templateId: templateIds.singlePageMemorial,
        metadata: {
          variables: formData,
          templateName: "Single Page Memorial",
          generatedAt: new Date().toISOString(),
        },
      });

      imageIds.push(result.id);
    } else {
      throw new Error("Invalid template key");
    }

    revalidateTag(TAGS.userGeneratedImages, "max");

    return { result: imageIds };
  } catch (error) {
    console.error("Error creating memorial image:", error);
    return { error: "Failed to create memorial image" };
  }
}

export async function deleteImage(id: string) {
  try {
    await db
      .delete(UserGeneratedImageTable)
      .where(eq(UserGeneratedImageTable.id, id));
    revalidateTag(TAGS.userGeneratedImages, "max");
    return { result: "Image deleted successfully" };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: "Failed to delete image" };
  }
}
