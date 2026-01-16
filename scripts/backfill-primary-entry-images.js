import "dotenv/config";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { and, asc, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const EntryTable = pgTable("entry", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  image: text("image"),
  updatedAt: timestamp("updated_at"),
});

const UserUploadTable = pgTable("user_upload", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  entryId: text("entry_id").notNull(),
  url: text("url").notNull(),
  key: text("key").notNull(),
  isPrimary: boolean("is_primary").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

const normalizeUrl = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const deriveKeyFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : null;
  } catch {
    return null;
  }
};

const shouldLog = process.env.VERBOSE === "true";
const dryRun = process.env.DRY_RUN === "true";
const entryIdFilter = process.env.ENTRY_ID || null;
const userIdFilter = process.env.USER_ID || null;
const limit = Number.parseInt(process.env.LIMIT ?? "", 10);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to run this backfill.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const log = (...args) => {
  if (shouldLog) {
    console.log(...args);
  }
};

const stats = {
  entriesScanned: 0,
  entriesMatched: 0,
  insertedUploads: 0,
  primariesSet: 0,
  entryImagesUpdated: 0,
  skippedNoImage: 0,
  skippedNoKey: 0,
};

const entriesWithoutPrimary = await db
  .select({
    id: EntryTable.id,
    userId: EntryTable.userId,
    image: EntryTable.image,
  })
  .from(EntryTable)
  .leftJoin(
    UserUploadTable,
    and(
      eq(UserUploadTable.entryId, EntryTable.id),
      eq(UserUploadTable.isPrimary, true)
    )
  )
  .where(isNull(UserUploadTable.id));

stats.entriesScanned = entriesWithoutPrimary.length;

let entries = entriesWithoutPrimary;
if (entryIdFilter) {
  entries = entries.filter((entry) => entry.id === entryIdFilter);
}
if (userIdFilter) {
  entries = entries.filter((entry) => entry.userId === userIdFilter);
}
if (Number.isFinite(limit) && limit > 0) {
  entries = entries.slice(0, limit);
}

stats.entriesMatched = entries.length;

for (const entry of entries) {
  const imageUrl = normalizeUrl(entry.image);
  const uploads = await db
    .select({
      id: UserUploadTable.id,
      url: UserUploadTable.url,
    })
    .from(UserUploadTable)
    .where(eq(UserUploadTable.entryId, entry.id))
    .orderBy(asc(UserUploadTable.createdAt));

  if (uploads.length === 0) {
    if (!imageUrl) {
      stats.skippedNoImage += 1;
      log("[skip] no uploads or entry image:", entry.id);
      continue;
    }

    const key = deriveKeyFromUrl(imageUrl);
    if (!key) {
      stats.skippedNoKey += 1;
      log("[skip] unable to derive key:", entry.id, imageUrl);
      continue;
    }

    const now = new Date();
    const insertOp = db.insert(UserUploadTable).values({
      id: randomUUID(),
      userId: entry.userId,
      entryId: entry.id,
      url: imageUrl,
      key,
      isPrimary: true,
      createdAt: now,
      updatedAt: now,
    });

    if (!dryRun) {
      await insertOp;
    }

    stats.insertedUploads += 1;
    stats.primariesSet += 1;
    log("[insert] created primary upload:", entry.id, imageUrl);
    continue;
  }

  const matchingUpload = imageUrl
    ? uploads.find((upload) => upload.url === imageUrl)
    : null;

  let primaryUrl = null;
  let primaryUploadId = null;
  let insertPrimary = false;
  let insertKey = null;

  if (matchingUpload) {
    primaryUrl = matchingUpload.url;
    primaryUploadId = matchingUpload.id;
  } else if (imageUrl) {
    insertKey = deriveKeyFromUrl(imageUrl);
    if (!insertKey) {
      stats.skippedNoKey += 1;
      log("[skip] unable to derive key:", entry.id, imageUrl);
      continue;
    }
    primaryUrl = imageUrl;
    insertPrimary = true;
  } else {
    primaryUrl = uploads[0]?.url ?? null;
    primaryUploadId = uploads[0]?.id ?? null;
  }

  if (!primaryUrl) {
    stats.skippedNoImage += 1;
    log("[skip] no primary candidate:", entry.id);
    continue;
  }

  const now = new Date();
  const operations = [
    db
      .update(UserUploadTable)
      .set({ isPrimary: false, updatedAt: now })
      .where(eq(UserUploadTable.entryId, entry.id)),
  ];

  if (insertPrimary) {
    operations.push(
      db.insert(UserUploadTable).values({
        id: randomUUID(),
        userId: entry.userId,
        entryId: entry.id,
        url: primaryUrl,
        key: insertKey,
        isPrimary: true,
        createdAt: now,
        updatedAt: now,
      })
    );
    stats.insertedUploads += 1;
  } else if (primaryUploadId) {
    operations.push(
      db
        .update(UserUploadTable)
        .set({ isPrimary: true, updatedAt: now })
        .where(eq(UserUploadTable.id, primaryUploadId))
    );
  }

  if (!imageUrl || imageUrl !== primaryUrl) {
    operations.push(
      db
        .update(EntryTable)
        .set({ image: primaryUrl, updatedAt: now })
        .where(eq(EntryTable.id, entry.id))
    );
    stats.entryImagesUpdated += 1;
  }

  if (!dryRun) {
    await db.batch(operations);
  }

  stats.primariesSet += 1;
  log("[update] set primary:", entry.id, primaryUrl);
}

console.log("Backfill complete.");
console.log(JSON.stringify(stats, null, 2));
if (dryRun) {
  console.log("DRY_RUN was enabled. No changes were written.");
}
