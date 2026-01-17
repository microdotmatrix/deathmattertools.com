"use client";

import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntryFeedbackWithUser } from "@/lib/db/schema";
import {
  ENTRY_FEEDBACK_TARGET_GROUPS,
  getEntryFeedbackTargetLabel,
} from "@/lib/entry-feedback/targets";
import { useState } from "react";
import { FeedbackStatusSection } from "./feedback-status-section";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "resolved", label: "Resolved" },
  { value: "denied", label: "Denied" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "target", label: "Target (A-Z)" },
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number]["value"];

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

type EntryFeedbackListProps = {
  feedback: EntryFeedbackWithUser[];
  currentUserId: string;
  canManage: boolean;
};

export const EntryFeedbackList = ({
  feedback,
  currentUserId,
  canManage,
}: EntryFeedbackListProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const items = ENTRY_FEEDBACK_TARGET_GROUPS.flatMap((group) => group.items);
  const targetOptions = items.map((item) => ({ value: item.key, label: item.label }));

  const filteredFeedback = feedback.filter((item) => {
    const statusMatch =
      statusFilter === "all" ? true : item.status === statusFilter;
    const targetMatch = (() => {
      if (targetFilter === "all") return true;
      if (targetFilter === "general") return !item.targetKey;
      return item.targetKey === targetFilter;
    })();

    return statusMatch && targetMatch;
  });

  const sortFeedback = (items: EntryFeedbackWithUser[]) => {
    const sorted = [...items];

    if (sortOption === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      return sorted;
    }

    if (sortOption === "target") {
      sorted.sort((a, b) => {
        const aLabel = getEntryFeedbackTargetLabel(a.targetKey).toLowerCase();
        const bLabel = getEntryFeedbackTargetLabel(b.targetKey).toLowerCase();
        const labelSort = aLabel.localeCompare(bLabel);
        if (labelSort !== 0) return labelSort;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      return sorted;
    }

    sorted.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted;
  };

  const pending = sortFeedback(
    filteredFeedback.filter((item) => item.status === "pending"),
  );
  const approved = sortFeedback(
    filteredFeedback.filter((item) => item.status === "approved"),
  );
  const resolved = sortFeedback(
    filteredFeedback.filter((item) => item.status === "resolved"),
  );
  const denied = sortFeedback(
    filteredFeedback.filter((item) => item.status === "denied"),
  );

  const filteredCount = filteredFeedback.length;
  const hasFilteredFeedback = filteredCount > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Icon icon="mdi:format-list-bulleted" className="w-4 h-4" />
          All Feedback
          <span className="text-muted-foreground">({filteredCount})</span>
        </h3>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={targetFilter} onValueChange={setTargetFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="All Targets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Targets</SelectItem>
              <SelectItem value="general">General</SelectItem>
              {targetOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilteredFeedback ? (
        <div className="space-y-3">
          <FeedbackStatusSection
            title="Pending Review"
            icon="mdi:clock-outline"
            status="pending"
            feedback={pending}
            currentUserId={currentUserId}
            canManage={canManage}
            defaultOpen={true}
          />

          <FeedbackStatusSection
            title="Approved"
            icon="mdi:check-circle"
            status="approved"
            feedback={approved}
            currentUserId={currentUserId}
            canManage={canManage}
            defaultOpen={false}
          />

          <FeedbackStatusSection
            title="Resolved"
            icon="mdi:check"
            status="resolved"
            feedback={resolved}
            currentUserId={currentUserId}
            canManage={canManage}
            defaultOpen={false}
          />

          <FeedbackStatusSection
            title="Denied"
            icon="mdi:close-circle"
            status="denied"
            feedback={denied}
            currentUserId={currentUserId}
            canManage={canManage}
            defaultOpen={false}
          />
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          No feedback matches the selected filters.
        </div>
      )}
    </div>
  );
};
