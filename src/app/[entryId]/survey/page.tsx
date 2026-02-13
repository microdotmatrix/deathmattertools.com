import { createOrGetEntrySurveyAction } from "@/actions/pre-need-survey";
import { SurveyForm } from "@/components/sections/pre-need-survey/survey-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import { getLatestSurveyResponse } from "@/lib/db/queries/pre-need-survey";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ entryId: string }>;
};

export default async function EntrySurveyPage({ params }: PageProps) {
  const { entryId } = await params;
  const access = await getEntryWithAccess(entryId);

  if (!access || !access.canView) {
    notFound();
  }

  const { entry, canEdit } = access;

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Icon icon="mdi:lock" className="size-16 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-center max-w-md">
          You don&apos;t have permission to fill out the survey for this entry.
          Only the entry owner can complete the survey directly.
        </p>
        <Link href={`/${entryId}`} className={buttonVariants({ variant: "outline" })}>
          <Icon icon="mdi:arrow-left" className="size-4 mr-2" />
          Back to Entry
        </Link>
      </div>
    );
  }

  // Get or create survey for this entry
  const result = await createOrGetEntrySurveyAction(entryId);
  
  if (result.error || !result.survey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Icon icon="mdi:alert-circle" className="size-16 text-destructive" />
        <h1 className="text-xl font-semibold">Error</h1>
        <p className="text-muted-foreground text-center max-w-md">
          {result.error ?? "Failed to create or retrieve survey."}
        </p>
        <Link href={`/${entryId}`} className={buttonVariants({ variant: "outline" })}>
          <Icon icon="mdi:arrow-left" className="size-4 mr-2" />
          Back to Entry
        </Link>
      </div>
    );
  }

  const { survey } = result;

  // Check if survey is locked or approved (can't edit)
  if (survey.status === "locked" || survey.status === "approved") {
    redirect(`/dashboard/surveys?surveyId=${survey.id}`);
  }

  // Get existing response data if any
  const response = await getLatestSurveyResponse(survey.id);

  return (
    <div className="space-y-6 loading-fade">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/${entryId}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
          Back to Entry
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:clipboard-text-outline" className="size-5" />
            Pre-Need Survey for {entry.name}
          </CardTitle>
          <CardDescription>
            Complete this survey to gather important legacy planning information.
            Your progress is saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SurveyForm
            surveyId={survey.id}
            entryId={entryId}
            initialData={response ?? null}
            initialStep={survey.currentStep ?? 0}
            isLocked={false}
            isOwnerMode={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
