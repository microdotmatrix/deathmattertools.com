"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { updateAnchorStatusAction } from "@/actions/comments";

interface AnchorModerationActionsProps {
  documentId: string;
  commentId: string;
  currentStatus: "pending" | "approved" | "denied";
  onStatusChange?: () => void;
}

export const AnchorModerationActions = ({
  documentId,
  commentId,
  currentStatus,
  onStatusChange,
}: AnchorModerationActionsProps) => {
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (status: "approved" | "denied") => {
    startTransition(async () => {
      const result = await updateAnchorStatusAction(documentId, commentId, status);
      
      if (result.success) {
        toast.success(
          status === "approved"
            ? "Suggestion approved"
            : "Suggestion denied"
        );
        onStatusChange?.();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {currentStatus !== "approved" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate("approved")}
          disabled={isPending}
          className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
        >
          <Icon icon="mdi:check-circle" className="w-3.5 h-3.5 mr-1" />
          Approve
        </Button>
      )}

      {currentStatus !== "denied" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate("denied")}
          disabled={isPending}
          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Icon icon="mdi:close-circle" className="w-3.5 h-3.5 mr-1" />
          Deny
        </Button>
      )}
      
      {isPending && (
        <Icon icon="mdi:loading" className="w-4 h-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
};
