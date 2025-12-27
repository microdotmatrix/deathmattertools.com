import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getPendingDocumentCommentCounts } from "@/lib/db/queries/comments";
import { getDocumentsByEntryId } from "@/lib/db/queries/documents";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import { getUserGeneratedImages } from "@/lib/db/queries/media";
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
  const [obituaries, generatedImages] = await Promise.all([
    getDocumentsByEntryId(entryId),
    getUserGeneratedImages(entry.userId!, entryId),
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
        />
      }
    >
      {children}
    </DashboardShell>
  );
}
