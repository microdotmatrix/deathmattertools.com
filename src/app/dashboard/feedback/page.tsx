import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardHeader, DashboardShell } from "@/components/layout/dashboard-shell";
import { FeedbackPageContent } from "@/components/sections/feedback/feedback-page-content";
import { FeedbackSummaryCards } from "@/components/sections/feedback/feedback-summary-cards";
import { Icon } from "@/components/ui/icon";
import { mockFeedback } from "@/lib/mock-data/feedback";

export default function FeedbackPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        title="Feedback"
        description="Review and manage user feedback from all sources."
        eyebrow="Admin"
      />
      <div className="space-y-6">
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <Icon icon="mdi:alert-outline" className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle>TODO: Restrict to System Admins</AlertTitle>
          <AlertDescription>
            This page will be restricted to system admins only in Phase 3. Access control will be implemented using Clerk.
          </AlertDescription>
        </Alert>

        <FeedbackSummaryCards feedback={mockFeedback} />

        <FeedbackPageContent feedback={mockFeedback} />
      </div>
    </DashboardShell>
  );
}
