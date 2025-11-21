"use client";

import { FeedbackForm } from "@/components/forms/feedback-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface BugReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId?: string;
}

export const BugReportDialog = ({
  open,
  onOpenChange,
  entryId,
}: BugReportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report a Bug</DialogTitle>
          <DialogDescription>
            Found something that's not working correctly? Let us know so we can
            fix it. The more details you provide, the faster we can resolve the
            issue.
          </DialogDescription>
        </DialogHeader>

        <FeedbackForm
          type="bug"
          source="inline_survey"
          entryId={entryId}
          onSuccess={() => onOpenChange(false)}
          subjectPlaceholder="What's not working?"
          messagePlaceholder="Please describe what happened, what you expected, and any steps to reproduce..."
          submitButtonText="Submit Bug Report"
        />
      </DialogContent>
    </Dialog>
  );
};
