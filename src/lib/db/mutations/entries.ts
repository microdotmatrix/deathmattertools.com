"use server";

import { isOrganizationOwner } from "@/lib/auth/organization-roles";
import { db } from "@/lib/db";
import { EntryDetailsTable, EntryTable, UserTable } from "@/lib/db/schema";
import { action } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { upsertUser } from "./auth";

const CreateEntrySchema = z.object({
  name: z.string().min(1).max(150),
  dateOfBirth: z.string(),
  dateOfDeath: z.string(),
  birthLocation: z.string().max(250),
  deathLocation: z.string().max(250),
  image: z.string(),
  causeOfDeath: z.string().max(250),
});

export const createEntryAction = action(CreateEntrySchema, async (data) => {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }
  
  try {
    // Ensure user exists in database (fallback if webhook failed)
    await ensureUserExists(userId);
    
    await db.insert(EntryTable).values({
      id: crypto.randomUUID(),
      name: data.name,
      dateOfBirth: new Date(data.dateOfBirth),
      dateOfDeath: new Date(data.dateOfDeath),
      locationBorn: data.birthLocation,
      locationDied: data.deathLocation,
      image: data.image,
      causeOfDeath: data.causeOfDeath,
      userId,
      organizationId: orgId ?? null,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create entry" };
  } finally {
    revalidatePath("/dashboard");
  }
});

/**
 * Ensures a user exists in the database.
 * If the user doesn't exist, creates them using Clerk data (webhook fallback).
 */
async function ensureUserExists(userId: string) {
  try {
    const existingUser = await db.query.UserTable.findFirst({
      where: eq(UserTable.id, userId),
    });

    if (!existingUser) {
      console.log(`[Fallback] User ${userId} not found in database, creating from Clerk data...`);
      const result = await upsertUser(userId);
      
      if (result) {
        console.log(`[Fallback] Successfully created user ${userId} in database`);
      } else {
        console.error(`[Fallback] Failed to create user ${userId} in database`);
        throw new Error("Failed to sync user data");
      }
    }
  } catch (error) {
    console.error(`[Fallback] Error ensuring user exists:`, error);
    throw error;
  }
}

const UpdateEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(150),
  dateOfBirth: z.string(),
  dateOfDeath: z.string(),
  birthLocation: z.string().max(250),
  deathLocation: z.string().max(250),
  image: z.string(),
  causeOfDeath: z.string().max(250),
});

export const updateEntryAction = action(UpdateEntrySchema, async (data) => {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // First, get the entry to check ownership and organization
    const entry = await db.query.EntryTable.findFirst({
      where: eq(EntryTable.id, data.id),
    });

    if (!entry) {
      return { error: "Entry not found" };
    }

    // Check if user is the owner
    const isOwner = entry.userId === userId;

    // Check if user is organization admin
    let isOrgAdmin = false;
    if (entry.organizationId && orgId === entry.organizationId) {
      isOrgAdmin = await isOrganizationOwner(entry.organizationId);
    }

    // Allow update if user is owner OR org admin
    if (!isOwner && !isOrgAdmin) {
      return { error: "You do not have permission to edit this entry" };
    }

    // Perform the update
    await db
      .update(EntryTable)
      .set({
        name: data.name,
        dateOfBirth: new Date(data.dateOfBirth),
        dateOfDeath: new Date(data.dateOfDeath),
        locationBorn: data.birthLocation,
        locationDied: data.deathLocation,
        image: data.image,
        causeOfDeath: data.causeOfDeath,
        updatedAt: new Date(),
      })
      .where(eq(EntryTable.id, data.id));

    return { success: true };
  } catch (error) {
    console.error("Error updating entry:", error);
    return { error: "Failed to update entry" };
  } finally {
    revalidatePath(`/dashboard`);
    revalidatePath(`/${data.id}`);
  }
});

export const deleteEntryAction = async (id: string) => {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { error: true, message: "Unauthorized" };
  }

  try {
    // First, get the entry to check ownership and organization
    const entry = await db.query.EntryTable.findFirst({
      where: eq(EntryTable.id, id),
    });

    if (!entry) {
      return { error: true, message: "Entry not found" };
    }

    // Check if user is the owner
    const isOwner = entry.userId === userId;

    // Check if user is organization admin
    let isOrgAdmin = false;
    if (entry.organizationId && orgId === entry.organizationId) {
      isOrgAdmin = await isOrganizationOwner(entry.organizationId);
    }

    // Allow deletion if user is owner OR org admin
    if (!isOwner && !isOrgAdmin) {
      return { error: true, message: "You do not have permission to delete this entry" };
    }

    // Perform the delete
    await db
      .delete(EntryTable)
      .where(eq(EntryTable.id, id));

    return { error: false };
  } catch (error) {
    console.error("Error deleting entry:", error);
    return { error: true, message: "Failed to delete entry" };
  } finally {
    revalidatePath("/dashboard");
  }
};

const UpdateEntryDetailsSchema = z.object({
  id: z.string(),
  occupation: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  yearsWorked: z.string().nullable().optional(),
  education: z.string().nullable().optional(),
  educationDetails: z.string().nullable().optional(),
  educationTypes: z.string().nullable().optional(),
  educationYears: z.string().nullable().optional(),
  accomplishments: z.string().nullable().optional(),
  biographicalSummary: z.string().nullable().optional(),
  hobbies: z.string().nullable().optional(),
  personalInterests: z.string().nullable().optional(),
  militaryService: z.boolean().nullable().optional(),
  militaryBranch: z.string().nullable().optional(),
  militaryRank: z.string().nullable().optional(),
  militaryYearsServed: z.number().nullable().optional(),
  religious: z.boolean().nullable().optional(),
  denomination: z.string().nullable().optional(),
  organization: z.string().nullable().optional(),
  favoriteScripture: z.string().nullable().optional(),
  familyDetails: z.string().nullable().optional(),
  survivedBy: z.string().nullable().optional(),
  precededBy: z.string().nullable().optional(),
  serviceDetails: z.string().nullable().optional(),
  donationRequests: z.string().nullable().optional(),
  specialAcknowledgments: z.string().nullable().optional(),
  additionalNotes: z.string().nullable().optional(),
});

export const updateEntryDetailsAction = action(
  UpdateEntryDetailsSchema,
  async (data) => {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    try {
      // Get the entry to check ownership and organization
      const entry = await db.query.EntryTable.findFirst({
        where: eq(EntryTable.id, data.id),
      });

      if (!entry) {
        return { error: "Entry not found" };
      }

      // Check if user is the owner
      const isOwner = entry.userId === userId;

      // Check if user is organization admin
      let isOrgAdmin = false;
      if (entry.organizationId && orgId === entry.organizationId) {
        isOrgAdmin = await isOrganizationOwner(entry.organizationId);
      }

      // Allow update if user is owner OR org admin
      if (!isOwner && !isOrgAdmin) {
        return { error: "You do not have permission to edit this entry" };
      }

      // Perform the update
      await db
        .update(EntryDetailsTable)
        .set({
          occupation: data.occupation,
          jobTitle: data.jobTitle,
          companyName: data.companyName,
          yearsWorked: data.yearsWorked,
          education: data.education,
          educationDetails: data.educationDetails,
          educationTypes: data.educationTypes,
          educationYears: data.educationYears,
          accomplishments: data.accomplishments,
          biographicalSummary: data.biographicalSummary,
          hobbies: data.hobbies,
          personalInterests: data.personalInterests,
          militaryService: data.militaryService,
          militaryBranch: data.militaryBranch,
          militaryRank: data.militaryRank,
          militaryYearsServed: data.militaryYearsServed,
          religious: data.religious,
          denomination: data.denomination,
          organization: data.organization,
          favoriteScripture: data.favoriteScripture,
          familyDetails: data.familyDetails,
          survivedBy: data.survivedBy,
          precededBy: data.precededBy,
          serviceDetails: data.serviceDetails,
          donationRequests: data.donationRequests,
          specialAcknowledgments: data.specialAcknowledgments,
          additionalNotes: data.additionalNotes,
          updatedAt: new Date(),
        })
        .where(eq(EntryDetailsTable.entryId, data.id));

      return { success: true };
    } catch (error) {
      console.error("Error updating entry details:", error);
      return { error: "Failed to update entry details" };
    } finally {
      revalidatePath(`/${data.id}`);
    }
  }
);

// Direct action for updating entry details (not wrapped with action utility)
// Action to set an image as the primary entry image
export const setPrimaryImageAction = async (
  entryId: string,
  imageUrl: string
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
      .where(and(eq(EntryTable.id, entryId), eq(EntryTable.userId, userId)))
      .limit(1);

    if (entry.length === 0) {
      return { error: "Entry not found or unauthorized" };
    }

    // Update the entry's primary image
    await db
      .update(EntryTable)
      .set({ image: imageUrl, updatedAt: new Date() })
      .where(and(eq(EntryTable.id, entryId), eq(EntryTable.userId, userId)));

    revalidatePath(`/${entryId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to set primary image:", error);
    return { error: "Failed to set primary image" };
  }
};

export const updateEntryDetailsDirectAction = async (
  entryId: string,
  formData: any
) => {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  const dataWithId = { ...formData, id: entryId };
  const result = UpdateEntryDetailsSchema.safeParse(dataWithId);

  if (!result.success) {
    return { error: result.error.message };
  }

  try {
    // First verify the user owns the entry
    const entry = await db
      .select()
      .from(EntryTable)
      .where(and(eq(EntryTable.id, entryId), eq(EntryTable.userId, userId)))
      .limit(1);

    if (entry.length === 0) {
      return { error: "Entry not found or unauthorized" };
    }

    // Use proper upsert pattern with onConflictDoUpdate
    // Note: neon-http adapter doesn't return rowCount, so we use Postgres ON CONFLICT
    const detailsData = {
      occupation: result.data.occupation,
      jobTitle: result.data.jobTitle,
      companyName: result.data.companyName,
      yearsWorked: result.data.yearsWorked,
      education: result.data.education,
      educationDetails: result.data.educationDetails,
      educationTypes: result.data.educationTypes,
      educationYears: result.data.educationYears,
      accomplishments: result.data.accomplishments,
      biographicalSummary: result.data.biographicalSummary,
      hobbies: result.data.hobbies,
      personalInterests: result.data.personalInterests,
      militaryService: result.data.militaryService,
      militaryBranch: result.data.militaryBranch,
      militaryRank: result.data.militaryRank,
      militaryYearsServed: result.data.militaryYearsServed,
      religious: result.data.religious,
      denomination: result.data.denomination,
      organization: result.data.organization,
      favoriteScripture: result.data.favoriteScripture,
      familyDetails: result.data.familyDetails,
      survivedBy: result.data.survivedBy,
      precededBy: result.data.precededBy,
      serviceDetails: result.data.serviceDetails,
      donationRequests: result.data.donationRequests,
      specialAcknowledgments: result.data.specialAcknowledgments,
      additionalNotes: result.data.additionalNotes,
    };

    await db
      .insert(EntryDetailsTable)
      .values({
        entryId,
        ...detailsData,
      })
      .onConflictDoUpdate({
        target: EntryDetailsTable.entryId,
        set: {
          ...detailsData,
          updatedAt: new Date(),
        },
      });

    revalidatePath(`/${entryId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update entry details:", error);
    return { error: "Failed to update entry details" };
  }
};