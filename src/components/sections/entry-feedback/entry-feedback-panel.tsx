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
import { FeedbackForm } from "./feedback-form";
import { FeedbackInfoAlert } from "./feedback-info-alert";
import { FeedbackStatusSection } from "./feedback-status-section";

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

  // Group feedback by status
  const pending = feedback.filter((f) => f.status === "pending");
  const approved = feedback.filter((f) => f.status === "approved");
  const resolved = feedback.filter((f) => f.status === "resolved");
  const denied = feedback.filter((f) => f.status === "denied");

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
            <Icon icon="mdi:bullseye-arrow" className="inline w-3.5 h-3.5 align-text-bottom" />{" "}
            target button to link your feedback to a specific field (e.g., name, dates, biography).
            This helps reviewers understand exactly what your comment refers to.
          </p>
          <FeedbackForm entryId={entryId} />
        </div>

        {/* Feedback Sections */}
        {hasFeedback ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Icon icon="mdi:format-list-bulleted" className="w-4 h-4" />
              All Feedback
              <span className="text-muted-foreground">({totalCount})</span>
            </h3>

            <div className="space-y-3">
              <FeedbackStatusSection
                title="Pending Review"
                icon="mdi:clock-outline"
                status="pending"
                feedback={pending}
                currentUserId={userId}
                canManage={canManage}
                defaultOpen={true}
              />

              <FeedbackStatusSection
                title="Approved"
                icon="mdi:check-circle"
                status="approved"
                feedback={approved}
                currentUserId={userId}
                canManage={canManage}
                defaultOpen={false}
              />

              <FeedbackStatusSection
                title="Resolved"
                icon="mdi:check"
                status="resolved"
                feedback={resolved}
                currentUserId={userId}
                canManage={canManage}
                defaultOpen={false}
              />

              <FeedbackStatusSection
                title="Denied"
                icon="mdi:close-circle"
                status="denied"
                feedback={denied}
                currentUserId={userId}
                canManage={canManage}
                defaultOpen={false}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Icon icon="mdi:comment-off-outline" className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              No feedback yet. Be the first to provide feedback on this entry.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
