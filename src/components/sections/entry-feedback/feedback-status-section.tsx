"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { FeedbackCard } from "./feedback-card";
import type { EntryFeedbackWithUser } from "@/lib/db/schema";

interface FeedbackStatusSectionProps {
  title: string;
  icon: string;
  status: "pending" | "approved" | "denied" | "resolved";
  feedback: EntryFeedbackWithUser[];
  currentUserId: string;
  canManage: boolean;
  defaultOpen?: boolean;
}

const STATUS_COLORS = {
  pending: "text-amber-600 dark:text-amber-400",
  approved: "text-green-600 dark:text-green-400",
  denied: "text-red-600 dark:text-red-400",
  resolved: "text-muted-foreground",
};

export const FeedbackStatusSection = ({
  title,
  icon,
  status,
  feedback,
  currentUserId,
  canManage,
  defaultOpen = false,
}: FeedbackStatusSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const count = feedback.length;

  if (count === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-3">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-3 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Icon
                icon={icon}
                className={cn("w-5 h-5", STATUS_COLORS[status])}
              />
              <span className="font-semibold">{title}</span>
              <Badge variant="secondary">{count}</Badge>
            </div>
            <Icon
              icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
              className="w-5 h-5 text-muted-foreground"
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-3">
          {feedback.map((item) => (
            <FeedbackCard
              key={item.id}
              feedback={item}
              currentUserId={currentUserId}
              canManage={canManage}
            />
          ))}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
