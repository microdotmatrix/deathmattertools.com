import { getExpiredPendingUploads } from "@/lib/db/queries/pending-uploads";
import { deletePendingUploads } from "@/lib/db/mutations/pending-uploads";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 second timeout

/**
 * Cron job to clean up orphaned uploads that exceeded their TTL.
 * Triggered by Vercel Cron every 30 minutes.
 *
 * Authorization via CRON_SECRET header (Vercel sets this automatically for cron jobs).
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET environment variable not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[Cron] Unauthorized cleanup attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expired = await getExpiredPendingUploads();

    if (expired.length === 0) {
      console.log("[Cron] No expired uploads found");
      return NextResponse.json({
        success: true,
        deleted: 0,
        message: "No expired uploads found",
        timestamp: new Date().toISOString(),
      });
    }

    const keys = expired.map((upload) => upload.key);
    const deletedCount = await deletePendingUploads(keys);

    console.log(
      `[Cron] Cleanup completed: ${deletedCount} uploads deleted (${expired.length} expired)`
    );

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      expired: expired.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Cleanup job failed:", error);
    return NextResponse.json(
      {
        error: "Cleanup job failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
