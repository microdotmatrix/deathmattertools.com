"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { useState } from "react";

interface FeedbackInfoAlertProps {
  canManage: boolean;
}

export const FeedbackInfoAlert = ({ canManage }: FeedbackInfoAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <Alert className="relative pr-10">
      <Icon icon="mdi:information" className="w-4 h-4" />
      <AlertDescription className="text-sm">
        {canManage ? (
          <>
            Organization members can provide feedback on entry details. You can
            approve, deny, or mark feedback as resolved.
          </>
        ) : (
          <>
            Use this section to suggest corrections, report errors, or provide
            additional information about this entry.
          </>
        )}
      </AlertDescription>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-3 p-0.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <Icon icon="mdi:close" className="size-4" />
      </button>
    </Alert>
  );
};
