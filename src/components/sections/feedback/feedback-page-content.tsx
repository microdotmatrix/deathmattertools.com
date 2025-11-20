"use client";

import { FeedbackDetailDialog } from "./feedback-detail-dialog";
import { FeedbackFilters } from "./feedback-filters";
import { FeedbackTable } from "./feedback-table";
import type { Feedback } from "@/lib/types/feedback";
import { useState } from "react";

type FeedbackPageContentProps = {
  feedback: Feedback[];
};

export const FeedbackPageContent = ({
  feedback,
}: FeedbackPageContentProps) => {
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>(feedback);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRowClick = (item: Feedback) => {
    setSelectedFeedback(item);
    setDialogOpen(true);
  };

  return (
    <>
      <FeedbackFilters
        feedback={feedback}
        onFilterChange={setFilteredFeedback}
      />
      <FeedbackTable feedback={filteredFeedback} onRowClick={handleRowClick} />
      <FeedbackDetailDialog
        feedback={selectedFeedback}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

