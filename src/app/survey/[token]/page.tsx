import { notFound } from "next/navigation";
import { getSurveyByShareToken } from "@/lib/db/queries/pre-need-survey";
import { SurveyForm } from "@/components/sections/pre-need-survey/survey-form";
import { PasswordProtectedSurvey } from "@/components/sections/pre-need-survey/password-protected-survey";
import { cookies } from "next/headers";

interface SurveyPageProps {
  params: Promise<{ token: string }>;
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const { token } = await params;

  // Get the survey with response via share token
  const surveyData = await getSurveyByShareToken(token);
  if (!surveyData) {
    notFound();
  }

  const { survey, response, shareLink, entry, canEdit } = surveyData;

  // Derive subject name from entry or use survey subject
  const subjectName = entry?.name || survey.subjectName || "Unknown";

  // Check if password protected and not verified
  if (shareLink.passwordHash) {
    const cookieStore = await cookies();
    const verifiedCookie = cookieStore.get(`survey-verified-${token}`);
    if (!verifiedCookie || verifiedCookie.value !== "true") {
      return <PasswordProtectedSurvey token={token} subjectName={subjectName} />;
    }
  }

  // Get current step from response if available
  const currentStep = response?.currentStep || 1;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <SurveyForm
          shareToken={token}
          initialData={response}
          initialStep={currentStep}
          isLocked={!canEdit}
          subjectName={subjectName}
        />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: SurveyPageProps) {
  const { token } = await params;
  const surveyData = await getSurveyByShareToken(token);

  if (!surveyData) {
    return {
      title: "Survey Not Found | Death Matter Tools",
    };
  }

  const subjectName = surveyData.entry?.name || surveyData.survey.subjectName || "Unknown";

  return {
    title: `Pre-Need Survey for ${subjectName} | Death Matter Tools`,
    description: "Complete your legacy planning survey",
  };
}
