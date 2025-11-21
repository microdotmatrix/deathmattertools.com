"use client";

import { FeedbackForm } from "@/components/forms/feedback-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface FeatureRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryId?: string;
}

export const FeatureRequestDialog = ({
  open,
  onOpenChange,
  entryId,
}: FeatureRequestDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a Feature</DialogTitle>
          <DialogDescription>
            Have an idea for improving the platform? We'd love to hear it! Your
            suggestions help us build better tools for everyone.
          </DialogDescription>
        </DialogHeader>

        <FeedbackForm
          type="feature_request"
          source="feature_request_card"
          entryId={entryId}
          onSuccess={() => onOpenChange(false)}
          subjectPlaceholder="What feature would you like to see?"
          messagePlaceholder="Describe the feature and how it would help you..."
          submitButtonText="Submit Feature Request"
        />
      </DialogContent>
    </Dialog>
  );
};
