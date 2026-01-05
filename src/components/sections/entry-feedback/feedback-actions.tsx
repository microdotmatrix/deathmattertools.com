"use client";

import {
  deleteFeedbackAction,
  updateFeedbackStatusAction,
} from "@/actions/entry-feedback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Icon } from "@/components/ui/icon";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface FeedbackActionsProps {
  feedbackId: string;
  status: "pending" | "approved" | "denied" | "resolved";
  actions: ("approve" | "deny" | "resolve" | "edit" | "delete")[];
  onEdit?: () => void;
}

export const FeedbackActions = ({
  feedbackId,
  status,
  actions,
  onEdit,
}: FeedbackActionsProps) => {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStatusUpdate = (newStatus: "approved" | "denied" | "resolved") => {
    startTransition(async () => {
      const result = await updateFeedbackStatusAction(feedbackId, newStatus);
      if (result.success) {
        toast.success(
          newStatus === "approved"
            ? "Feedback approved"
            : newStatus === "denied"
            ? "Feedback denied"
            : "Feedback marked as resolved"
        );
      } else {
        toast.error(result.error || "Failed to update feedback");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteFeedbackAction(feedbackId);
      if (result.success) {
        toast.success("Feedback deleted");
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error || "Failed to delete feedback");
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        {/* Left group: Edit, Delete */}
        <div className="flex items-center gap-2">
          {actions.includes("edit") && onEdit && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-foreground hover:text-primary disabled:opacity-50"
              onClick={onEdit}
              disabled={isPending}
            >
              <Icon icon="lucide:pencil" className="size-3" />
              Edit
            </button>
          )}
          {actions.includes("delete") && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-destructive hover:text-destructive/80 disabled:opacity-50"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isPending}
            >
              <Icon icon="lucide:trash-2" className="size-3" />
              Delete
            </button>
          )}
        </div>

        {/* Right group: Approve, Deny, Resolve */}
        <div className="flex items-center gap-2">
          {actions.includes("approve") && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-foreground hover:text-primary disabled:opacity-50"
              onClick={() => handleStatusUpdate("approved")}
              disabled={isPending}
            >
              <Icon icon="mdi:check-circle" className="size-3" />
              Approve
            </button>
          )}
          {actions.includes("deny") && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-destructive hover:text-destructive/80 disabled:opacity-50"
              onClick={() => handleStatusUpdate("denied")}
              disabled={isPending}
            >
              <Icon icon="mdi:close-circle" className="size-3" />
              Deny
            </button>
          )}
          {actions.includes("resolve") && (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-foreground hover:text-primary disabled:opacity-50"
              onClick={() => handleStatusUpdate("resolved")}
              disabled={isPending}
            >
              <Icon icon="mdi:check" className="size-3" />
              Resolve
            </button>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This feedback will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
