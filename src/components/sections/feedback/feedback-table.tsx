"use client";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { Feedback } from "@/lib/types/feedback";
import { FeedbackStatus, FeedbackType } from "@/lib/types/feedback";
import { format } from "date-fns";
import { useMemo } from "react";

type FeedbackTableProps = {
  feedback: Feedback[];
  onRowClick: (feedback: Feedback) => void;
};

const getTypeLabel = (type: FeedbackType): string => {
  switch (type) {
    case FeedbackType.CONTACT:
      return "Contact";
    case FeedbackType.FEATURE_REQUEST:
      return "Feature";
    case FeedbackType.BUG:
      return "Bug";
    case FeedbackType.OTHER:
      return "Other";
    default:
      return type;
  }
};

const getTypeVariant = (type: FeedbackType): "default" | "secondary" | "outline" => {
  switch (type) {
    case FeedbackType.CONTACT:
      return "default";
    case FeedbackType.FEATURE_REQUEST:
      return "secondary";
    case FeedbackType.BUG:
      return "outline";
    default:
      return "secondary";
  }
};

const getStatusLabel = (status: FeedbackStatus): string => {
  switch (status) {
    case FeedbackStatus.NEW:
      return "New";
    case FeedbackStatus.IN_REVIEW:
      return "In Review";
    case FeedbackStatus.RESOLVED:
      return "Resolved";
    case FeedbackStatus.DISMISSED:
      return "Dismissed";
    default:
      return status;
  }
};

const getStatusVariant = (
  status: FeedbackStatus
): "default" | "secondary" | "outline" => {
  switch (status) {
    case FeedbackStatus.NEW:
      return "default";
    case FeedbackStatus.IN_REVIEW:
      return "secondary";
    case FeedbackStatus.RESOLVED:
      return "outline";
    case FeedbackStatus.DISMISSED:
      return "outline";
    default:
      return "secondary";
  }
};

export const FeedbackTable = ({ feedback, onRowClick }: FeedbackTableProps) => {
  const sortedFeedback = useMemo(() => {
    return [...feedback].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [feedback]);

  if (sortedFeedback.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No feedback items match your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div className="col-span-2">Type</div>
            <div className="col-span-4">Subject</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Source</div>
          </div>

          {/* Rows */}
          <div className="divide-y">
            {sortedFeedback.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onRowClick(item)}
                className="grid w-full grid-cols-12 gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
              >
                <div className="col-span-2">
                  <Badge variant={getTypeVariant(item.type)}>
                    {getTypeLabel(item.type)}
                  </Badge>
                </div>
                <div className="col-span-4">
                  <p className="font-medium">{item.subject}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {item.message}
                  </p>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {format(item.createdAt, "MMM d, yyyy")}
                </div>
                <div className="col-span-2">
                  <Badge variant={getStatusVariant(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {item.source.replace(/_/g, " ")}
                  </span>
                  <Icon
                    icon="mdi:chevron-right"
                    className="size-4 text-muted-foreground"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

