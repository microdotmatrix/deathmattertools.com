"use server";

import { db } from "@/lib/db";
import { OrganizationDetailsTable } from "@/lib/db/schema/organizations";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const OrganizationDetailsSchema = z.object({
  businessName: z.string().optional().nullable(),
  businessEmail: z.string().email().optional().nullable().or(z.literal("")),
  businessPhone: z.string().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  businessType: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
});

export type OrganizationDetailsState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

export async function updateOrganizationDetails(
  prevState: OrganizationDetailsState,
  formData: FormData
): Promise<OrganizationDetailsState> {
  try {
    const session = await auth();

    if (!session?.userId) {
      return { error: "User not authenticated" };
    }

    if (!session.orgId) {
      return { error: "No organization selected" };
    }

    // Check if user has admin role in the organization
    const orgRole = session.orgRole;
    if (orgRole !== "org:admin") {
      return { error: "Only organization admins can update organization details" };
    }

    const rawData = {
      businessName: formData.get("businessName") || null,
      businessEmail: formData.get("businessEmail") || null,
      businessPhone: formData.get("businessPhone") || null,
      websiteUrl: formData.get("websiteUrl") || null,
      addressLine1: formData.get("addressLine1") || null,
      addressLine2: formData.get("addressLine2") || null,
      city: formData.get("city") || null,
      state: formData.get("state") || null,
      postalCode: formData.get("postalCode") || null,
      country: formData.get("country") || null,
      businessType: formData.get("businessType") || null,
      licenseNumber: formData.get("licenseNumber") || null,
      taxId: formData.get("taxId") || null,
    };

    const validatedFields = OrganizationDetailsSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        error: "Invalid form data",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Clean empty strings to null for optional URL/email fields
    const cleanedData = {
      ...data,
      businessEmail: data.businessEmail === "" ? null : data.businessEmail,
      websiteUrl: data.websiteUrl === "" ? null : data.websiteUrl,
    };

    await db
      .insert(OrganizationDetailsTable)
      .values({
        organizationId: session.orgId,
        ...cleanedData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: OrganizationDetailsTable.organizationId,
        set: {
          ...cleanedData,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/dashboard/organization");
    return { success: true };
  } catch (error) {
    console.error("Failed to update organization details:", error);
    return { error: "Failed to update organization details" };
  }
}
