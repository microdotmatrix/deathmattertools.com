import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSurveys } from "@/lib/db/queries/pre-need-survey";
import { SurveysOverview } from "@/components/sections/pre-need-survey/surveys-overview";

export const metadata = {
  title: "Pre-Need Surveys | Death Matter Tools",
  description: "Manage your pre-need surveys",
};

export default async function SurveysPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const surveys = await getUserSurveys();

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pre-Need Surveys</h1>
        <p className="text-muted-foreground">
          Manage pre-need surveys for your entries. Surveys collect important
          legacy planning information from clients.
        </p>
      </div>

      <SurveysOverview surveys={surveys} />
    </div>
  );
}
