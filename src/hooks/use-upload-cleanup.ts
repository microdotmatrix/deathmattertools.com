"use client";

import { deletePendingUploadByKey } from "@/lib/db/mutations/pending-uploads";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Hook to clean up orphaned uploads on unmount/cancel.
 * Provides best-effort client-side cleanup.
 *
 * @param imageKey The UploadThing file key to clean up
 * @param isSubmitted Whether the form was successfully submitted (prevents cleanup)
 */
export function useUploadCleanup(
  imageKey: string | null,
  isSubmitted: boolean = false
) {
  const cleanupAttemptedRef = useRef(false);
  const isSubmittedRef = useRef(isSubmitted);

  // Keep submitted ref in sync using useLayoutEffect to ensure it runs
  // synchronously before any unmount effects (prevents race condition)
  useLayoutEffect(() => {
    isSubmittedRef.current = isSubmitted;
  }, [isSubmitted]);

  useEffect(() => {
    // Cleanup on unmount (if image uploaded but form not submitted)
    return () => {
      if (imageKey && !cleanupAttemptedRef.current && !isSubmittedRef.current) {
        cleanupAttemptedRef.current = true;

        // Fire-and-forget cleanup (don't await)
        deletePendingUploadByKey(imageKey).catch((error) => {
          // Silent fail - cron will handle cleanup
          console.warn(
            "[Cleanup] Client-side cleanup failed, cron will handle:",
            error
          );
        });
      }
    };
  }, [imageKey]);

  // Manual cleanup function (for reset button)
  const cleanupUpload = async () => {
    if (imageKey && !cleanupAttemptedRef.current) {
      cleanupAttemptedRef.current = true;
      try {
        await deletePendingUploadByKey(imageKey);
      } catch (error) {
        console.warn("[Cleanup] Manual cleanup failed:", error);
      }
    }
  };

  // Reset cleanup state (for when new upload happens)
  const resetCleanupState = () => {
    cleanupAttemptedRef.current = false;
  };

  return { cleanupUpload, resetCleanupState };
}
