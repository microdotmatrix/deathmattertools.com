import { auth } from "@clerk/nextjs/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { getEntryFeedback, canManageFeedback } from "@/lib/db/queries";
import { FeedbackForm } from "./feedback-form";
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
          <div className="flex-1">
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
        <Alert>
          <Icon icon="mdi:information" className="w-4 h-4" />
          <AlertDescription className="text-sm">
            {canManage ? (
              <>
                Organization members can provide feedback on entry details. You
                can approve, deny, or mark feedback as resolved.
              </>
            ) : (
              <>
                Use this section to suggest corrections, report errors, or
                provide additional information about this entry.
              </>
            )}
          </AlertDescription>
        </Alert>

        {/* Add Feedback Form */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Icon icon="mdi:plus-circle" className="w-4 h-4" />
            Add Feedback
          </h3>
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
