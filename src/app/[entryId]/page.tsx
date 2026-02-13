import { EntryEditContent } from "@/components/sections/entries/entry-edit-content";
import { EntryEditContentSkeleton } from "@/components/skeletons/entry";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ showSurveyPrompt?: string }>;
}

export default async function EntryEditPage({ params, searchParams }: PageProps) {
  const { entryId } = await params;
  const { showSurveyPrompt } = await searchParams;
  const access = await getEntryWithAccess(entryId);

  if (!access || !access.canView) {
    notFound();
  }

  const { entry, canEdit, role, isOrgOwner } = access;

  return (
    <Suspense fallback={<EntryEditContentSkeleton />}>
      <EntryEditContent
        entry={entry}
        canEdit={canEdit}
        role={role}
        isOrgOwner={isOrgOwner}
        showSurveyPrompt={showSurveyPrompt === "true"}
      />
    </Suspense>
  );
}
