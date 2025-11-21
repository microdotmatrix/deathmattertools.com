"use client";

import { updateFeedbackStatusAndNotesAction } from "@/actions/system-feedback-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Feedback } from "@/lib/types/feedback";
import { FeedbackStatus, FeedbackType } from "@/lib/types/feedback";
import { format } from "date-fns";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type FeedbackDetailDialogProps = {
  feedback: Feedback | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const getTypeLabel = (type: FeedbackType): string => {
  switch (type) {
    case FeedbackType.CONTACT:
      return "Contact";
    case FeedbackType.FEATURE_REQUEST:
      return "Feature Request";
    case FeedbackType.BUG:
      return "Bug";
    case FeedbackType.OTHER:
      return "Other";
    default:
      return type;
  }
};

const getStatusLabel = (status: FeedbackStatus): string => {
  switch (status) {
    case FeedbackStatus.NEW:
      return "New";
    case FeedbackStatus.IN_REVIEW:
      return "In Review";
    case FeedbackStatus.RESOLVED:
      return "Resolved";
    case FeedbackStatus.DISMISSED:
      return "Dismissed";
    default:
      return status;
  }
};

export const FeedbackDetailDialog = ({
  feedback,
  open,
  onOpenChange,
}: FeedbackDetailDialogProps) => {
  const [status, setStatus] = useState<FeedbackStatus | "">("");
  const [internalNotes, setInternalNotes] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Update local state when feedback changes
  useEffect(() => {
    if (feedback) {
      setStatus(feedback.status);
      setInternalNotes(feedback.internalNotes || "");
    }
  }, [feedback]);

  if (!feedback) {
    return null;
  }

  const handleSave = () => {
    if (!status) {
      toast.error("Status is required");
      return;
    }

    startTransition(async () => {
      const result = await updateFeedbackStatusAndNotesAction({
        feedbackId: feedback.id,
        status: status as "new" | "in_review" | "resolved" | "dismissed",
        internalNotes: internalNotes || undefined,
      });

      if (result.success) {
        toast.success("Feedback updated successfully");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to update feedback");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-full lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{feedback.subject}</DialogTitle>
          <DialogDescription>
            Created {format(feedback.createdAt, "MMMM d, yyyy 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <div className="mt-1">
                <Badge variant="secondary">{getTypeLabel(feedback.type)}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Source</Label>
              <p className="mt-1 text-sm">
                {feedback.source.replace(/_/g, " ")}
              </p>
            </div>
            {feedback.priority && (
              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <div className="mt-1">
                  <Badge variant="outline">{feedback.priority}</Badge>
                </div>
              </div>
            )}
            {(feedback.user || feedback.userId) && (
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Submitted By</Label>
                <div className="mt-1">
                  {feedback.user ? (
                    <div>
                      <p className="text-sm font-medium">{feedback.user.name}</p>
                      <p className="text-xs text-muted-foreground">{feedback.user.email}</p>
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-muted-foreground">{feedback.userId}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <Label className="text-xs text-muted-foreground">Message</Label>
            <div className="mt-2 rounded-md border bg-muted/50 p-4 w-full overflow-hidden">
              <p className="text-sm whitespace-pre-wrap wrap-break-word overflow-wrap-anywhere">{feedback.message}</p>
            </div>
          </div>

          {/* Screenshot if present */}
          {feedback.metadata?.screenshot && typeof feedback.metadata.screenshot === 'string' && (
            <div>
              <Label className="text-xs text-muted-foreground">Screenshot</Label>
              <div className="mt-2 rounded-md border overflow-hidden">
                <img
                  src={feedback.metadata.screenshot}
                  alt="Error screenshot"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Metadata JSON if present */}
          {feedback.metadata && Object.keys(feedback.metadata).length > 0 && (
            <div className="w-full">
              <Label className="text-xs text-muted-foreground">Metadata</Label>
              <div className="mt-2 rounded-md border bg-muted/50 p-4 w-full overflow-x-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(feedback.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Editable Fields */}
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as FeedbackStatus)}
              >
                <SelectTrigger id="status" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FeedbackStatus.NEW}>
                    {getStatusLabel(FeedbackStatus.NEW)}
                  </SelectItem>
                  <SelectItem value={FeedbackStatus.IN_REVIEW}>
                    {getStatusLabel(FeedbackStatus.IN_REVIEW)}
                  </SelectItem>
                  <SelectItem value={FeedbackStatus.RESOLVED}>
                    {getStatusLabel(FeedbackStatus.RESOLVED)}
                  </SelectItem>
                  <SelectItem value={FeedbackStatus.DISMISSED}>
                    {getStatusLabel(FeedbackStatus.DISMISSED)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes about this feedback..."
                className="mt-2 min-h-24"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

