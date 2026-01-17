import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { canManageFeedback, getEntryFeedback } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { EntryFeedbackList } from "./entry-feedback-list";
import { FeedbackForm } from "./feedback-form";
import { FeedbackInfoAlert } from "./feedback-info-alert";

interface EntryFeedbackPanelProps {
  entryId: string;
}

export const EntryFeedbackPanel = async ({
  entryId,
}: EntryFeedbackPanelProps) => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const [feedback, canManage] = await Promise.all([
    getEntryFeedback(entryId),
    canManageFeedback(entryId),
  ]);

  // User doesn't have access to this entry
  if (feedback === null) {
    return null;
  }

  const totalCount = feedback.length;
  const hasFeedback = totalCount > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon
                icon="mdi:comment-text-multiple"
                className="w-5 h-5 text-primary"
              />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <CardTitle>Entry Feedback & Collaboration</CardTitle>
            <CardDescription>
              {canManage
                ? "Review and manage feedback from your organization members"
                : "Provide feedback to help improve this entry's accuracy"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Info Alert */}
        <FeedbackInfoAlert canManage={canManage} />

        {/* Add Feedback Form */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Icon icon="mdi:plus-circle" className="w-4 h-4" />
            Add Feedback
          </h3>
          <p className="text-xs text-muted-foreground">
            Use the{" "}
            <Icon
              icon="mdi:bullseye-arrow"
              className="inline w-3.5 h-3.5 align-text-bottom"
            />{" "}
            target button to link your feedback to a specific field (e.g., name,
            dates, biography). This helps reviewers understand exactly what your
            comment refers to.
          </p>
          <FeedbackForm entryId={entryId} />
        </div>

        {/* Feedback Sections */}
        {hasFeedback ? (
          <EntryFeedbackList
            feedback={feedback}
            currentUserId={userId}
            canManage={canManage}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Icon
              icon="mdi:comment-off-outline"
              className="w-12 h-12 mx-auto mb-3 opacity-50"
            />
            <p className="text-sm">
              No feedback yet. Be the first to provide feedback on this entry.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
