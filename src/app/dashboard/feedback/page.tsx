import { DashboardHeader, DashboardShell } from "@/components/layout/dashboard-shell";
import { FeedbackPageContent } from "@/components/sections/feedback/feedback-page-content";
import { FeedbackSummaryCards } from "@/components/sections/feedback/feedback-summary-cards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getFeedbackStatusCounts, getFeedbackTypeCounts, getSystemFeedback } from "@/lib/db/queries/system-feedback";
import type { SystemFeedbackWithUser } from "@/lib/db/schema";
import type { Feedback } from "@/lib/types/feedback";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

type SessionClaims = ReturnType<typeof auth> extends Promise<infer T>
  ? T extends { sessionClaims?: infer Claims }
    ? Claims
    : unknown
  : unknown;

const extractRoleFromSession = (sessionClaims: SessionClaims | undefined): string | undefined => {
  if (!sessionClaims) return undefined;

  const claimsWithPublicMetadata = sessionClaims as {
    publicMetadata?: Record<string, unknown>;
  };

  const publicMetadataRole = claimsWithPublicMetadata.publicMetadata?.role;
  if (typeof publicMetadataRole === "string") {
    return publicMetadataRole;
  }

  const orgShortcutRole = (sessionClaims as { o?: { rol?: unknown } }).o?.rol;
  if (typeof orgShortcutRole === "string") {
    return orgShortcutRole;
  }

  const metadataClaimRole = (sessionClaims as { metadata?: { role?: unknown } }).metadata?.role;
  if (typeof metadataClaimRole === "string") {
    return metadataClaimRole;
  }

  return undefined;
};

// Convert database records to UI type
function mapToFeedbackType(dbFeedback: SystemFeedbackWithUser[]): Feedback[] {
  return dbFeedback.map((item) => ({
    id: item.id,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    type: item.type as Feedback["type"],
    source: item.source as Feedback["source"],
    userId: item.userId || undefined,
    entryId: item.entryId || undefined,
    subject: item.subject,
    message: item.message,
    status: item.status as Feedback["status"],
    priority: item.priority as Feedback["priority"],
    metadata: item.metadata as Record<string, unknown> | undefined,
    internalNotes: item.internalNotes || undefined,
    user: item.user || undefined,
  }));
}

export default async function FeedbackPage() {
  // Check authentication and role
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const userRoleFromProfile = user?.publicMetadata?.role;
  const userRoleFromSession = extractRoleFromSession(sessionClaims);
  const userRole = typeof userRoleFromProfile === "string" ? userRoleFromProfile : userRoleFromSession;
  const isSystemAdmin = userRole === "system_admin";

  if (!isSystemAdmin) {
    return (
      <DashboardShell>
        <DashboardHeader
          title="Access Denied"
          description="You don't have permission to view this page."
          eyebrow="Admin"
        />
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
          <Alert variant="destructive" className="max-w-2xl">
            <Icon icon="mdi:shield-lock-outline" className="size-4" />
            <AlertTitle>System Administrator Access Required</AlertTitle>
            <AlertDescription>
              This page is restricted to system administrators only. Please contact your administrator if you believe you should have access.
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/dashboard">
              <Icon icon="mdi:arrow-left" className="mr-2 size-4" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  // Fetch real feedback data
  const { feedback: dbFeedback, total } = await getSystemFeedback({ limit: 100 });
  const statusCounts = await getFeedbackStatusCounts();
  const typeCounts = await getFeedbackTypeCounts();
  
  // Map to UI type
  const feedback = mapToFeedbackType(dbFeedback);

  return (
    <DashboardShell>
      <DashboardHeader
        title="Feedback"
        description="Review and manage user feedback from all sources."
        eyebrow="Admin"
      />
      <div className="space-y-6">
        <FeedbackSummaryCards feedback={feedback} />

        <FeedbackPageContent feedback={feedback} />
      </div>
    </DashboardShell>
  );
}
