import { notFound } from "next/navigation";
import { getSurveyByShareToken } from "@/lib/db/queries/pre-need-survey";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ThankYouPageProps {
  params: Promise<{ token: string }>;
}

export default async function ThankYouPage({ params }: ThankYouPageProps) {
  const { token } = await params;

  const surveyData = await getSurveyByShareToken(token);
  if (!surveyData) {
    notFound();
  }

  const { survey, response, entry } = surveyData;
  const subjectName = entry?.name || survey.subjectName || "Unknown";
  const isComplete = response?.isComplete;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-lg mx-auto p-6">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>

        {isComplete ? (
          <>
            <p className="text-lg text-muted-foreground mb-4">
              Your survey responses for <strong>{subjectName}</strong> have been
              submitted successfully.
            </p>
            <p className="text-muted-foreground mb-8">
              The survey owner will be notified and can review your responses.
              You may still access and update your answers until the survey is
              locked.
            </p>
          </>
        ) : (
          <>
            <p className="text-lg text-muted-foreground mb-4">
              Your progress for <strong>{subjectName}'s</strong> survey has been
              saved.
            </p>
            <p className="text-muted-foreground mb-8">
              You can return at any time to complete the survey using the same
              link.
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href={`/survey/${token}`}>
              {isComplete ? "Review Your Answers" : "Continue Survey"}
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            This information will help your loved ones during a difficult time.
            Thank you for taking the time to complete this important planning
            step.
          </p>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ThankYouPageProps) {
  const { token } = await params;
  const surveyData = await getSurveyByShareToken(token);

  if (!surveyData) {
    return {
      title: "Survey Submitted | Death Matter Tools",
      description: "Thank you for completing the pre-need survey",
    };
  }

  const subjectName = surveyData.entry?.name || surveyData.survey.subjectName || "Unknown";

  return {
    title: `Survey Submitted - ${subjectName} | Death Matter Tools`,
    description: "Thank you for completing the pre-need survey",
  };
}
