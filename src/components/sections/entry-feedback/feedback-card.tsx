"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { getEntryFeedbackTargetLabel } from "@/lib/entry-feedback/targets";
import { cn, formatRelativeTime } from "@/lib/utils";
import { FeedbackActions } from "./feedback-actions";
import { FeedbackForm } from "./feedback-form";
import type { EntryFeedbackWithUser } from "@/lib/db/schema";

interface FeedbackCardProps {
  feedback: EntryFeedbackWithUser;
  currentUserId: string;
  canManage: boolean;
}

const STATUS_CONFIG = {
  pending: {
    icon: "mdi:clock-outline",
    label: "Pending Review",
    variant: "secondary" as const,
    className: "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/50",
  },
  approved: {
    icon: "mdi:check-circle",
    label: "Approved",
    variant: "secondary" as const,
    className: "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/50",
  },
  denied: {
    icon: "mdi:close-circle",
    label: "Denied",
    variant: "secondary" as const,
    className: "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/50",
  },
  resolved: {
    icon: "mdi:check",
    label: "Resolved",
    variant: "outline" as const,
    className: "border-muted bg-muted/50",
  },
};

export const FeedbackCard = ({
  feedback,
  currentUserId,
  canManage,
}: FeedbackCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const isAuthor = feedback.userId === currentUserId;
  const config = STATUS_CONFIG[feedback.status];
  const targetLabel = getEntryFeedbackTargetLabel(feedback.targetKey);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine available actions
  const actions: ("approve" | "deny" | "resolve" | "edit" | "delete")[] = [];
  
  if (canManage && feedback.status === "pending") {
    actions.push("approve", "deny");
  }
  
  if (canManage && feedback.status === "approved") {
    actions.push("resolve");
  }
  
  if (isAuthor && feedback.status === "pending") {
    actions.push("edit", "delete");
  }

  if (isEditing) {
    return (
      <div className={cn("rounded-lg border p-4", config.className)}>
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={feedback.user.imageUrl || undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(feedback.user.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon icon={config.icon} className="w-3 h-3" />
                {config.label}
              </Badge>
            </div>
          </div>
        </div>

        <FeedbackForm
          entryId={feedback.entryId}
          existingFeedback={{
            id: feedback.id,
            content: feedback.content,
            targetKey: feedback.targetKey,
          }}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border p-4 space-y-3", config.className)}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={feedback.user.imageUrl || undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(feedback.user.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{feedback.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(feedback.createdAt))}
            </span>
            <Badge variant={config.variant} className="flex items-center gap-1">
              <Icon icon={config.icon} className="w-3 h-3" />
              {config.label}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Icon icon="mdi:bullseye" className="w-3 h-3" />
              Target: {targetLabel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm whitespace-pre-wrap break-words">{feedback.content}</p>

      {/* Status change info */}
      {feedback.statusChangedAt && (
        <div className="text-xs text-muted-foreground">
          Updated {formatRelativeTime(new Date(feedback.statusChangedAt))}
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="pt-2">
          <FeedbackActions
            feedbackId={feedback.id}
            status={feedback.status}
            actions={actions}
            onEdit={() => setIsEditing(true)}
          />
        </div>
      )}
    </div>
  );
};
