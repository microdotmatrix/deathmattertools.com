import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getPendingDocumentCommentCounts } from "@/lib/db/queries/comments";
import { getDocumentsByEntryId } from "@/lib/db/queries/documents";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import { getUserGeneratedImages } from "@/lib/db/queries/media";
import { getSurveysByEntryId } from "@/lib/db/queries/pre-need-survey";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { EntrySidebarContent } from "./_components/entry-sidebar-content";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ entryId: string }>;
};

export default async function EntryLayout({ children, params }: LayoutProps) {
  const { entryId } = await params;
  const access = await getEntryWithAccess(entryId);

  if (!access || !access.canView) {
    notFound();
  }

  const { entry, canEdit } = access;
  const [obituaries, generatedImages, surveys] = await Promise.all([
    getDocumentsByEntryId(entryId),
    getUserGeneratedImages(entry.userId!, entryId),
    getSurveysByEntryId(entryId),
  ]);
  const pendingCommentCounts = canEdit
    ? await getPendingDocumentCommentCounts(obituaries.map((obituary) => obituary.id))
    : {};

  const serializedObituaries = obituaries.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));
  const serializedImages = generatedImages.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
  }));
  const serializedSurveys = surveys.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    statusChangedAt: s.statusChangedAt?.toISOString() ?? null,
    lockedAt: s.lockedAt?.toISOString() ?? null,
    lastClientAccessAt: s.lastClientAccessAt?.toISOString() ?? null,
  }));

  return (
    <DashboardShell
      sidebarContent={
        <EntrySidebarContent
          entryId={entryId}
          entryName={entry.name}
          canEdit={canEdit}
          obituaries={serializedObituaries}
          pendingCommentCounts={pendingCommentCounts}
          generatedImages={serializedImages}
          surveys={serializedSurveys}
        />
      }
    >
      {children}
    </DashboardShell>
  );
}
