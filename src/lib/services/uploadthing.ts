import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

import { entryDetailTag, entryListTag } from "@/lib/cache";
import { db } from "@/lib/db";
import { countUploadsForEntry } from "@/lib/db/queries";
import { EntryTable, PendingUploadTable, UserUploadTable } from "@/lib/db/schema";

// Export UTApi instance for file deletion operations
export const utapi = new UTApi();

type UploadMetadata = {
  userId: string;
  entryId?: string;
};

type UploadedFile = {
  ufsUrl: string;
  key: string;
};

const f = createUploadthing();
const MAX_UPLOADS = 8;

export const uploadRouter = {
  entryProfileImage: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }: { metadata: UploadMetadata; file: UploadedFile }) => {
      // Track this upload as pending until entry creation claims it
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours TTL
      await db.insert(PendingUploadTable).values({
        id: crypto.randomUUID(),
        userId: metadata.userId,
        key: file.key,
        url: file.ufsUrl,
        uploadType: "entry_profile",
        expiresAt,
      });

      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        key: file.key,
      };
    }),
  entryGalleryImage: f({ image: { maxFileSize: "4MB" } })
    .input(z.object({ entryId: z.uuid() }))
    .middleware(async ({ input }: { input: { entryId: string } }) => {
      const { userId } = await auth();
      if (!userId) {
        throw new UploadThingError("Unauthorized");
      }

      const entry = await db.query.EntryTable.findFirst({
        where: and(eq(EntryTable.id, input.entryId), eq(EntryTable.userId, userId)),
        columns: { id: true },
      });

      if (!entry) {
        throw new UploadThingError("Entry not found");
      }

      const uploadCount = await countUploadsForEntry(input.entryId);
      if (uploadCount >= MAX_UPLOADS) {
        throw new UploadThingError("Image limit reached for this entry");
      }

      return { userId, entryId: input.entryId };
    })
    .onUploadComplete(async ({ metadata, file }: { metadata: UploadMetadata & { entryId: string }; file: UploadedFile }) => {
      const id = crypto.randomUUID();
      const inserted = await db
        .insert(UserUploadTable)
        .values({
          id,
          entryId: metadata.entryId,
          userId: metadata.userId,
          url: file.ufsUrl,
          key: file.key,
          isPrimary: false,
        })
        .returning();

      const upload = inserted[0];

      if (!upload) {
        throw new UploadThingError("Failed to save upload");
      }

      await db
        .update(EntryTable)
        .set({ updatedAt: new Date() })
        .where(eq(EntryTable.id, metadata.entryId));

      revalidateTag(entryDetailTag(metadata.entryId));
      revalidateTag(entryListTag(metadata.userId));

      return { url: upload.url, id: upload.id };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;