"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Feedback } from "@/lib/types/feedback";
import { FeedbackStatus, FeedbackType } from "@/lib/types/feedback";
import { useEffect, useState } from "react";

type FeedbackFiltersProps = {
  feedback: Feedback[];
  onFilterChange: (filtered: Feedback[]) => void;
};

export const FeedbackFilters = ({
  feedback,
  onFilterChange,
}: FeedbackFiltersProps) => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let filtered = [...feedback];

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Filter by source
    if (sourceFilter !== "all") {
      filtered = filtered.filter((item) => item.source === sourceFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.subject.toLowerCase().includes(query) ||
          item.message.toLowerCase().includes(query)
      );
    }

    onFilterChange(filtered);
  }, [feedback, typeFilter, statusFilter, sourceFilter, searchQuery, onFilterChange]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search by subject or message..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value={FeedbackType.CONTACT}>Contact</SelectItem>
          <SelectItem value={FeedbackType.FEATURE_REQUEST}>
            Feature Request
          </SelectItem>
          <SelectItem value={FeedbackType.BUG}>Bug</SelectItem>
          <SelectItem value={FeedbackType.OTHER}>Other</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value={FeedbackStatus.NEW}>New</SelectItem>
          <SelectItem value={FeedbackStatus.IN_REVIEW}>In Review</SelectItem>
          <SelectItem value={FeedbackStatus.RESOLVED}>Resolved</SelectItem>
          <SelectItem value={FeedbackStatus.DISMISSED}>Dismissed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sourceFilter} onValueChange={setSourceFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="error_reporter">Error Reporter</SelectItem>
          <SelectItem value="user_form">User Form</SelectItem>
          <SelectItem value="pre_need_survey">Pre-Need Survey</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

