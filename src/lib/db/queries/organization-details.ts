import "server-only";

import { db } from "@/lib/db";
import { OrganizationDetailsTable } from "@/lib/db/schema/organizations";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function getOrganizationDetails() {
  const session = await auth();

  if (!session?.orgId) {
    return null;
  }

  const details = await db
    .select()
    .from(OrganizationDetailsTable)
    .where(eq(OrganizationDetailsTable.organizationId, session.orgId))
    .limit(1);

  return details[0] || null;
}

export async function getOrganizationDetailsById(organizationId: string) {
  const details = await db
    .select()
    .from(OrganizationDetailsTable)
    .where(eq(OrganizationDetailsTable.organizationId, organizationId))
    .limit(1);

  return details[0] || null;
}

export type OrganizationDetailsWithDefaults = Awaited<ReturnType<typeof getOrganizationDetails>>;
