"use client";

import { createFeedbackAction, updateFeedbackAction } from "@/actions/entry-feedback";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

type FeedbackState = {
  success?: boolean;
  error?: string;
  feedback?: string;
};

interface FeedbackFormProps {
  entryId: string;
  existingFeedback?: {
    id: string;
    content: string;
  };
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const FeedbackForm = ({
  entryId,
  existingFeedback,
  onCancel,
  onSuccess,
}: FeedbackFormProps) => {
  const [content, setContent] = useState(existingFeedback?.content || "");
  const isEdit = !!existingFeedback;

  const [createState, createFormAction, isCreating] = useActionState(
    createFeedbackAction.bind(null, entryId),
    {}
  );

  const [updateState, updateFormAction, isUpdating] = useActionState(
    existingFeedback
      ? updateFeedbackAction.bind(null, existingFeedback.id)
      : (() => Promise.resolve({})),
    {}
  );

  const state: FeedbackState = isEdit ? updateState : createState;
  const formAction = isEdit ? updateFormAction : createFormAction;
  const isPending = isEdit ? isUpdating : isCreating;

  useEffect(() => {
    if (state.success) {
      toast.success(isEdit ? "Feedback updated" : "Feedback submitted");
      setContent("");
      onSuccess?.();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, isEdit, onSuccess]);

  return (
    <form action={formAction} className="space-y-3">
      <Textarea
        name="content"
        placeholder="Provide feedback on this entry's details (e.g., corrections, missing information, suggestions)..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        className="min-h-[100px]"
        maxLength={2000}
      />
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length}/2000 characters
        </span>
        
        <div className="flex items-center gap-2">
          {isEdit && onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !content.trim() || content.length > 2000}
          >
            {isPending ? (
              <>
                <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
                {isEdit ? "Updating..." : "Submitting..."}
              </>
            ) : (
              <>
                <Icon
                  icon={isEdit ? "mdi:check" : "mdi:send"}
                  className="w-4 h-4 mr-2"
                />
                {isEdit ? "Update" : "Submit Feedback"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
