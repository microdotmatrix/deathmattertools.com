"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CreateSurveyDialog } from "../pre-need-survey/create-survey-dialog";

const SURVEY_PROMPT_DISMISSED_KEY = "survey-prompt-dismissed";

type SurveyPromptModalProps = {
  entryId: string;
  entryName: string;
};

export const SurveyPromptModal = ({
  entryId,
  entryName,
}: SurveyPromptModalProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateSurveyDialog, setShowCreateSurveyDialog] = useState(false);

  const getDismissedEntries = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(SURVEY_PROMPT_DISMISSED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const dismissForEntry = () => {
    if (typeof window === "undefined") return;
    try {
      const dismissed = getDismissedEntries();
      if (!dismissed.includes(entryId)) {
        dismissed.push(entryId);
        localStorage.setItem(
          SURVEY_PROMPT_DISMISSED_KEY,
          JSON.stringify(dismissed),
        );
      }
    } catch {
      // Ignore localStorage errors
    }
  };

  const removeQueryParam = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("showSurveyPrompt");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  // Check if we should show the prompt
  useEffect(() => {
    const dismissedEntries = getDismissedEntries();
    if (!dismissedEntries.includes(entryId)) {
      setIsOpen(true);
    } else {
      // Remove the query param if already dismissed
      removeQueryParam();
    }
  }, [entryId, removeQueryParam]);

  const handleClose = () => {
    setIsOpen(false);
    removeQueryParam();
  };

  const handleSkip = () => {
    dismissForEntry();
    handleClose();
  };

  const handleCompleteSurvey = () => {
    handleClose();
    router.push(`/${entryId}/survey`);
  };

  const handleSendToFamily = () => {
    handleClose();
    setShowCreateSurveyDialog(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon
                icon="mdi:clipboard-text-outline"
                className="size-5 text-primary"
              />
              Gather Legacy Information
            </DialogTitle>
            <DialogDescription>
              Would you like to gather important legacy planning information for{" "}
              <span className="font-medium text-foreground">{entryName}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              Our pre-need survey helps collect essential details like key
              contacts, important documents, healthcare preferences, and
              end-of-life wishes.
            </p>

            <div className="grid gap-3">
              {/* Complete Survey Option */}
              <button
                type="button"
                onClick={handleCompleteSurvey}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Icon icon="mdi:pencil" className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    Complete Survey Yourself
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fill out the survey directly with the information you have
                  </p>
                </div>
              </button>

              {/* Send to Family Option */}
              <button
                type="button"
                onClick={handleSendToFamily}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
                  <Icon icon="mdi:send" className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Send to Family Member</p>
                  <p className="text-xs text-muted-foreground">
                    Share a secure link for someone to complete the survey
                  </p>
                </div>
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip for Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Survey Dialog */}
      <CreateSurveyDialog
        entryId={entryId}
        entryName={entryName}
        open={showCreateSurveyDialog}
        onOpenChange={setShowCreateSurveyDialog}
      />
    </>
  );
};
