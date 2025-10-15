"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AnchorStatus } from "@/lib/db/schema";

interface CommentAnchorBadgeProps {
  anchorText: string;
  status: AnchorStatus;
  valid: boolean;
  onGoToAnchor?: () => void;
  className?: string;
}

export const CommentAnchorBadge = ({
  anchorText,
  status,
  valid,
  onGoToAnchor,
  className,
}: CommentAnchorBadgeProps) => {
  const statusConfig = {
    approved: {
      icon: "mdi:check-circle",
      label: "Approved",
      className: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400",
    },
    denied: {
      icon: "mdi:close-circle",
      label: "Denied",
      className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
    },
    pending: {
      icon: "mdi:clock-outline",
      label: "Pending Review",
      className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
    },
  }[status];

  const truncateText = (text: string, maxLength = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  };

  if (!valid) {
    return (
      <Badge variant="outline" className={cn("text-xs", className)}>
        <Icon icon="mdi:alert" className="w-3 h-3 mr-1.5" />
        Text has changed
      </Badge>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onGoToAnchor}
        className="h-7 px-2 text-xs hover:bg-muted"
      >
        <Icon icon="mdi:anchor" className="w-3 h-3 mr-1.5" />
        &ldquo;{truncateText(anchorText)}&rdquo;
        <Icon icon="mdi:arrow-right" className="w-3 h-3 ml-1.5" />
      </Button>
      
      {status !== "pending" && (
        <Badge
          variant="outline"
          className={cn("text-xs", statusConfig.className)}
        >
          <Icon icon={statusConfig.icon} className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      )}
    </div>
  );
};
