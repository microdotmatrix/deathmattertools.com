"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
import { toast } from "sonner";
import {
  updateFeedbackStatusAction,
  deleteFeedbackAction,
} from "@/actions/entry-feedback";

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
      <div className="flex items-center gap-2 flex-wrap">
        {actions.includes("approve") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate("approved")}
            disabled={isPending}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Icon icon="mdi:check-circle" className="w-4 h-4 mr-1.5" />
            Approve
          </Button>
        )}

        {actions.includes("deny") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate("denied")}
            disabled={isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Icon icon="mdi:close-circle" className="w-4 h-4 mr-1.5" />
            Deny
          </Button>
        )}

        {actions.includes("resolve") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate("resolved")}
            disabled={isPending}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Icon icon="mdi:check" className="w-4 h-4 mr-1.5" />
            Mark as Resolved
          </Button>
        )}

        {actions.includes("edit") && onEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            disabled={isPending}
          >
            <Icon icon="mdi:pencil" className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
        )}

        {actions.includes("delete") && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isPending}
            className="text-red-600 hover:text-red-700"
          >
            <Icon icon="mdi:delete" className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        )}
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
