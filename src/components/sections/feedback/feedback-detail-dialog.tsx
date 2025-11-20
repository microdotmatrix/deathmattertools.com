"use client";

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
import { useEffect, useState } from "react";
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
    // Phase 1: Non-functional, just show toast
    toast.success("Feedback updated", {
      description: "In Phase 1, changes are not persisted. This will be functional in Phase 2.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            {feedback.userId && (
              <div>
                <Label className="text-xs text-muted-foreground">User ID</Label>
                <p className="mt-1 font-mono text-xs">
                  {feedback.userId}
                </p>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <Label className="text-xs text-muted-foreground">Message</Label>
            <div className="mt-2 rounded-md border bg-muted/50 p-4">
              <p className="text-sm whitespace-pre-wrap">{feedback.message}</p>
            </div>
          </div>

          {/* Metadata JSON if present */}
          {feedback.metadata && Object.keys(feedback.metadata).length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Metadata</Label>
              <div className="mt-2 rounded-md border bg-muted/50 p-4">
                <pre className="text-xs overflow-x-auto">
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

