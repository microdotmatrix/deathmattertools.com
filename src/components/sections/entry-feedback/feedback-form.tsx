"use client";

import { createFeedbackAction, updateFeedbackAction } from "@/actions/entry-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Icon } from "@/components/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ENTRY_FEEDBACK_TARGET_GROUPS,
  getEntryFeedbackTargetLabel,
} from "@/lib/entry-feedback/targets";
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
    targetKey?: string | null;
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
  const [targetKey, setTargetKey] = useState<string | null>(
    existingFeedback?.targetKey ?? null
  );
  const [isTargetMenuOpen, setIsTargetMenuOpen] = useState(false);
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
      setTargetKey(null);
      onSuccess?.();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, isEdit, onSuccess]);

  return (
    <form action={formAction} className="space-y-2">
      <div>
        <Textarea
          name="content"
          placeholder="Provide feedback on this entry's details (e.g., corrections, missing information, suggestions)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
          className="min-h-[100px]"
          maxLength={2000}
        />
        <input type="hidden" name="targetKey" value={targetKey ?? ""} />
        
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Popover open={isTargetMenuOpen} onOpenChange={setIsTargetMenuOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    className="size-8"
                  >
                    <Icon icon="mdi:bullseye-arrow" className="w-4 h-4" />
                    <span className="sr-only">Add feedback target</span>
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Target specific entry field</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-72 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search entry components..." />
                <CommandList>
                  <CommandEmpty>No components found.</CommandEmpty>
                  {ENTRY_FEEDBACK_TARGET_GROUPS.map((group) => (
                    <CommandGroup key={group.label} heading={group.label}>
                      {group.items.map((item) => (
                        <CommandItem
                          key={item.key}
                          value={item.label}
                          onSelect={() => {
                            setTargetKey(item.key);
                            setIsTargetMenuOpen(false);
                          }}
                        >
                          <span className="flex-1">{item.label}</span>
                          {targetKey === item.key && (
                            <Icon icon="mdi:check" className="w-4 h-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {targetKey ? (
            <>
              <Badge variant="outline" className="flex items-center gap-1">
                <Icon icon="mdi:bullseye" className="w-3 h-3" />
                {getEntryFeedbackTargetLabel(targetKey)}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setTargetKey(null)}
                disabled={isPending}
                className="size-7"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
                <span className="sr-only">Clear target</span>
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No target selected</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {content.length}/2000
          </span>
          
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
            className="flex items-center gap-2"
          >
            {isPending ? (
              <>
                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">{isEdit ? "Updating..." : "Submitting..."}</span>
              </>
            ) : (
              <>
                <Icon
                  icon={isEdit ? "mdi:check" : "mdi:send"}
                  className="w-4 h-4"
                />
                <span className="hidden sm:inline">{isEdit ? "Update" : "Submit"}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
