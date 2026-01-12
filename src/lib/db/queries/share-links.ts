import "server-only";

import { db } from "@/lib/db";
import {
  DocumentTable,
  GuestCommenterTable,
  ShareLinkTable,
  UserGeneratedImageTable,
  EntryTable,
} from "@/lib/db/schema";
import { and, eq, gt, or, isNull } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import {
  shareLinkTag,
  shareLinksByDocumentTag,
  shareLinksByImageTag,
  shareLinksByEntryTag,
} from "@/lib/cache";

/**
 * Get a share link by its public token.
 * Returns null if not found, expired, or disabled.
 */
export async function getShareLinkByToken(token: string) {
  "use cache";
  cacheLife("content");
  cacheTag(shareLinkTag(token));

  try {
    const [link] = await db
      .select()
      .from(ShareLinkTable)
      .where(
        and(
          eq(ShareLinkTable.token, token),
          eq(ShareLinkTable.isEnabled, true),
          // Either no expiry or not yet expired
          or(
            isNull(ShareLinkTable.expiresAt),
            gt(ShareLinkTable.expiresAt, new Date())
          )
        )
      );

    return link ?? null;
  } catch (error) {
    console.error("Failed to get share link by token:", error);
    return null;
  }
}

/**
 * Get a share link by ID (for management purposes).
 * Does not check expiry/enabled status.
 */
export async function getShareLinkById(id: string) {
  try {
    const [link] = await db
      .select()
      .from(ShareLinkTable)
      .where(eq(ShareLinkTable.id, id));

    return link ?? null;
  } catch (error) {
    console.error("Failed to get share link by id:", error);
    return null;
  }
}

/**
 * Get all share links for a document.
 */
export async function getShareLinksByDocumentId(documentId: string) {
  "use cache";
  cacheLife("content");
  cacheTag(shareLinksByDocumentTag(documentId));

  try {
    const links = await db
      .select()
      .from(ShareLinkTable)
      .where(eq(ShareLinkTable.documentId, documentId))
      .orderBy(ShareLinkTable.createdAt);

    return links;
  } catch (error) {
    console.error("Failed to get share links for document:", error);
    return [];
  }
}

/**
 * Get all share links for an image.
 */
export async function getShareLinksByImageId(imageId: string) {
  "use cache";
  cacheLife("content");
  cacheTag(shareLinksByImageTag(imageId));

  try {
    const links = await db
      .select()
      .from(ShareLinkTable)
      .where(eq(ShareLinkTable.imageId, imageId))
      .orderBy(ShareLinkTable.createdAt);

    return links;
  } catch (error) {
    console.error("Failed to get share links for image:", error);
    return [];
  }
}

/**
 * Get all share links for an entry (documents + images).
 */
export async function getShareLinksByEntryId(entryId: string) {
  "use cache";
  cacheLife("content");
  cacheTag(shareLinksByEntryTag(entryId));

  try {
    const links = await db
      .select()
      .from(ShareLinkTable)
      .where(eq(ShareLinkTable.entryId, entryId))
      .orderBy(ShareLinkTable.createdAt);

    return links;
  } catch (error) {
    console.error("Failed to get share links for entry:", error);
    return [];
  }
}

/**
 * Get a shared document by share token.
 * Returns the document with entry info for public viewing.
 */
export async function getSharedDocumentByToken(token: string) {
  "use cache";
  cacheLife("content");
  cacheTag(shareLinkTag(token));

  try {
    const link = await getShareLinkByToken(token);

    if (!link || link.type !== "document" || !link.documentId) {
      return null;
    }

    // Get the document
    const [document] = await db
      .select()
      .from(DocumentTable)
      .where(eq(DocumentTable.id, link.documentId));

    if (!document) {
      return null;
    }

    // Get the entry for context (name, dates, image)
    const [entry] = await db
      .select({
        id: EntryTable.id,
        name: EntryTable.name,
        dateOfBirth: EntryTable.dateOfBirth,
        dateOfDeath: EntryTable.dateOfDeath,
        image: EntryTable.image,
      })
      .from(EntryTable)
      .where(eq(EntryTable.id, link.entryId));

    return {
      shareLink: link,
      document,
      entry: entry ?? null,
    };
  } catch (error) {
    console.error("Failed to get shared document:", error);
    return null;
  }
}

/**
 * Get a shared image by share token.
 * Returns the image with entry info for public viewing.
 */
export async function getSharedImageByToken(token: string) {
  "use cache";
  cacheLife("content");
  cacheTag(shareLinkTag(token));

  try {
    const link = await getShareLinkByToken(token);

    if (!link || link.type !== "image" || !link.imageId) {
      return null;
    }

    // Get the image
    const [image] = await db
      .select()
      .from(UserGeneratedImageTable)
      .where(eq(UserGeneratedImageTable.id, link.imageId));

    if (!image) {
      return null;
    }

    // Get the entry for context
    const [entry] = await db
      .select({
        id: EntryTable.id,
        name: EntryTable.name,
        dateOfBirth: EntryTable.dateOfBirth,
        dateOfDeath: EntryTable.dateOfDeath,
        image: EntryTable.image,
      })
      .from(EntryTable)
      .where(eq(EntryTable.id, link.entryId));

    return {
      shareLink: link,
      image,
      entry: entry ?? null,
    };
  } catch (error) {
    console.error("Failed to get shared image:", error);
    return null;
  }
}

/**
 * Get a guest commenter by email and share link.
 */
export async function getGuestCommenterByEmail(
  email: string,
  shareLinkId: string
) {
  try {
    const [guest] = await db
      .select()
      .from(GuestCommenterTable)
      .where(
        and(
          eq(GuestCommenterTable.email, email),
          eq(GuestCommenterTable.shareLinkId, shareLinkId)
        )
      );

    return guest ?? null;
  } catch (error) {
    console.error("Failed to get guest commenter:", error);
    return null;
  }
}

/**
 * Get a guest commenter by their token fingerprint.
 */
export async function getGuestCommenterByFingerprint(fingerprint: string) {
  try {
    const [guest] = await db
      .select()
      .from(GuestCommenterTable)
      .where(eq(GuestCommenterTable.tokenFingerprint, fingerprint));

    return guest ?? null;
  } catch (error) {
    console.error("Failed to get guest commenter by fingerprint:", error);
    return null;
  }
}

/**
 * Get a guest commenter by ID.
 */
export async function getGuestCommenterById(id: string) {
  try {
    const [guest] = await db
      .select()
      .from(GuestCommenterTable)
      .where(eq(GuestCommenterTable.id, id));

    return guest ?? null;
  } catch (error) {
    console.error("Failed to get guest commenter by id:", error);
    return null;
  }
}
