import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getSurveyWithAccess } from "@/lib/db/queries/pre-need-survey";
import { SurveyDetailView } from "@/components/sections/pre-need-survey/survey-detail-view";

interface SurveyDetailPageProps {
  params: Promise<{ surveyId: string }>;
}

export default async function SurveyDetailPage({
  params,
}: SurveyDetailPageProps) {
  const { surveyId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const surveyData = await getSurveyWithAccess(surveyId);

  if (!surveyData || !surveyData.canView) {
    notFound();
  }

  return (
    <div className="container py-8">
      <SurveyDetailView
        survey={surveyData.survey}
        response={surveyData.response}
        subjectName={surveyData.subjectName}
        role={surveyData.role}
        canEdit={surveyData.canEdit}
        canLock={surveyData.canLock}
        canApprove={surveyData.canApprove}
      />
    </div>
  );
}

export async function generateMetadata({ params }: SurveyDetailPageProps) {
  const { surveyId } = await params;
  const surveyData = await getSurveyWithAccess(surveyId);

  if (!surveyData) {
    return {
      title: "Survey Not Found | Death Matter Tools",
    };
  }

  return {
    title: `Survey: ${surveyData.subjectName} | Death Matter Tools`,
    description: "View and manage pre-need survey responses",
  };
}
