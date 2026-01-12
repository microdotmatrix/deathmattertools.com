import { db } from "@/lib/db";
import {
  GuestCommenterTable,
  ShareLinkTable,
  type ShareLinkInsert,
  type GuestCommenterInsert,
} from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Generate a URL-safe share token.
 * Uses 21 characters for ~126 bits of entropy.
 */
export function generateShareToken(): string {
  return nanoid(21);
}

/**
 * Create a new share link for a document.
 */
export async function createDocumentShareLink({
  documentId,
  documentCreatedAt,
  entryId,
  createdBy,
  expiresAt,
  allowComments = false,
  passwordHash,
}: {
  documentId: string;
  documentCreatedAt: Date;
  entryId: string;
  createdBy: string;
  expiresAt?: Date | null;
  allowComments?: boolean;
  passwordHash?: string | null;
}) {
  const token = generateShareToken();
  const now = new Date();

  const values: ShareLinkInsert = {
    token,
    type: "document",
    documentId,
    documentCreatedAt,
    entryId,
    createdBy,
    expiresAt: expiresAt ?? null,
    allowComments,
    passwordHash: passwordHash ?? null,
    isEnabled: true,
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const [link] = await db.insert(ShareLinkTable).values(values).returning();

  return link;
}

/**
 * Create a new share link for an image.
 */
export async function createImageShareLink({
  imageId,
  entryId,
  createdBy,
  expiresAt,
  allowComments = false,
  passwordHash,
}: {
  imageId: string;
  entryId: string;
  createdBy: string;
  expiresAt?: Date | null;
  allowComments?: boolean;
  passwordHash?: string | null;
}) {
  const token = generateShareToken();
  const now = new Date();

  const values: ShareLinkInsert = {
    token,
    type: "image",
    imageId,
    entryId,
    createdBy,
    expiresAt: expiresAt ?? null,
    allowComments,
    passwordHash: passwordHash ?? null,
    isEnabled: true,
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const [link] = await db.insert(ShareLinkTable).values(values).returning();

  return link;
}

/**
 * Update a share link's settings.
 */
export async function updateShareLink({
  id,
  isEnabled,
  allowComments,
  expiresAt,
  passwordHash,
}: {
  id: string;
  isEnabled?: boolean;
  allowComments?: boolean;
  expiresAt?: Date | null;
  passwordHash?: string | null;
}) {
  const updates: Partial<ShareLinkInsert> = {
    updatedAt: new Date(),
  };

  if (isEnabled !== undefined) updates.isEnabled = isEnabled;
  if (allowComments !== undefined) updates.allowComments = allowComments;
  if (expiresAt !== undefined) updates.expiresAt = expiresAt;
  if (passwordHash !== undefined) updates.passwordHash = passwordHash;

  const [link] = await db
    .update(ShareLinkTable)
    .set(updates)
    .where(eq(ShareLinkTable.id, id))
    .returning();

  return link ?? null;
}

/**
 * Delete a share link.
 */
export async function deleteShareLink(id: string) {
  const [link] = await db
    .delete(ShareLinkTable)
    .where(eq(ShareLinkTable.id, id))
    .returning();

  return link ?? null;
}

/**
 * Increment the view count for a share link.
 */
export async function incrementShareLinkViewCount(token: string) {
  try {
    await db
      .update(ShareLinkTable)
      .set({
        viewCount: sql`${ShareLinkTable.viewCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(ShareLinkTable.token, token));
  } catch (error) {
    // Non-critical, log and continue
    console.error("Failed to increment view count:", error);
  }
}

/**
 * Create or update a guest commenter.
 * If a guest with the same email already exists for this share link,
 * updates their info and returns the existing record.
 */
export async function upsertGuestCommenter({
  email,
  name,
  shareLinkId,
  tokenFingerprint,
}: {
  email: string;
  name: string;
  shareLinkId: string;
  tokenFingerprint: string;
}) {
  const now = new Date();

  // Try to find existing guest
  const [existing] = await db
    .select()
    .from(GuestCommenterTable)
    .where(
      and(
        eq(GuestCommenterTable.email, email),
        eq(GuestCommenterTable.shareLinkId, shareLinkId)
      )
    );

  if (existing) {
    // Update existing guest's fingerprint and last access
    const [updated] = await db
      .update(GuestCommenterTable)
      .set({
        name,
        tokenFingerprint,
        lastAccessedAt: now,
      })
      .where(eq(GuestCommenterTable.id, existing.id))
      .returning();

    return updated;
  }

  // Create new guest
  const values: GuestCommenterInsert = {
    email,
    name,
    shareLinkId,
    tokenFingerprint,
    emailVerified: false,
    createdAt: now,
    lastAccessedAt: now,
  };

  const [guest] = await db
    .insert(GuestCommenterTable)
    .values(values)
    .returning();

  return guest;
}

/**
 * Update guest commenter's last access time.
 */
export async function updateGuestLastAccess(id: string) {
  await db
    .update(GuestCommenterTable)
    .set({ lastAccessedAt: new Date() })
    .where(eq(GuestCommenterTable.id, id));
}

/**
 * Mark a guest's email as verified.
 */
export async function verifyGuestEmail(id: string) {
  const [guest] = await db
    .update(GuestCommenterTable)
    .set({ emailVerified: true })
    .where(eq(GuestCommenterTable.id, id))
    .returning();

  return guest ?? null;
}

/**
 * Delete a guest commenter.
 */
export async function deleteGuestCommenter(id: string) {
  const [guest] = await db
    .delete(GuestCommenterTable)
    .where(eq(GuestCommenterTable.id, id))
    .returning();

  return guest ?? null;
}
