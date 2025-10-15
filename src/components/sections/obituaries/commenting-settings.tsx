"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { updateCommentingSettingsAction } from "@/actions/commenting-settings";

interface OrganizationCommentingSettingsProps {
  documentId: string;
  initialEnabled: boolean;
  canModify: boolean;
  disabledReason?: string | null;
  organizationMemberCount?: number;
  organizationInContext?: boolean;
}

export const OrganizationCommentingSettings = ({
  documentId,
  initialEnabled,
  canModify,
  disabledReason,
  organizationMemberCount = 0,
  organizationInContext = false,
}: OrganizationCommentingSettingsProps) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (nextValue: boolean) => {
    if (!canModify) {
      if (disabledReason) {
        toast.error(disabledReason);
      }
      return;
    }

    startTransition(async () => {
      const result = await updateCommentingSettingsAction(documentId, nextValue);

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        setEnabled(nextValue);
        toast.success(
          nextValue
            ? "Organization members can now comment."
            : "Commenting is limited to document owners."
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            Allow organization comments
          </p>
          <p className="text-sm text-muted-foreground">
            When enabled, members of your organization can add comments to this
            obituary. Owners always retain comment and edit permissions.
          </p>
        </div>
        <Switch
          checked={enabled}
          disabled={isPending || !canModify}
          onCheckedChange={handleToggle}
        />
      </div>
      <div
        className={cn(
          "flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground",
          !canModify && "border-dashed"
        )}
      >
        <div className="flex items-center gap-2">
          <Icon icon="lucide:users" className="size-4" />
          <span>
            {organizationMemberCount > 0 ? (
              <>
                Sharing with{" "}
                <span className="font-semibold text-foreground">
                  {organizationMemberCount}
                </span>{" "}
                {organizationMemberCount === 1 ? "member" : "members"} of your
                organization when enabled.
              </>
            ) : organizationInContext ? (
              "No other members in this organization yet."
            ) : (
              "Switch to an organization to invite collaborators."
            )}
          </span>
        </div>
        {!canModify && disabledReason ? (
          <div className="flex items-center gap-2 text-destructive">
            <Icon icon="lucide:alert-triangle" className="size-4" />
            <span>{disabledReason}</span>
          </div>
        ) : null}
        {enabled ? (
          <Badge variant="secondary" className="w-fit">
            Organization access active
          </Badge>
        ) : (
          <Badge variant="outline" className="w-fit">
            Owner-only comments
          </Badge>
        )}
      </div>
    </div>
  );
};
