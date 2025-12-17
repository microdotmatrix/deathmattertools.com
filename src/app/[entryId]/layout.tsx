import { EntrySidebar } from "@/components/layout/entry-sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getDocumentsByEntryId } from "@/lib/db/queries/documents";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import { getUserGeneratedImages } from "@/lib/db/queries/media";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

interface EntryLayoutProps {
  children: ReactNode;
  params: Promise<{ entryId: string }>;
}

export default async function EntryLayout({
  children,
  params,
}: EntryLayoutProps) {
  const { entryId } = await params;
  const access = await getEntryWithAccess(entryId);

  if (!access || !access.canView) {
    notFound();
  }

  const [obituaries, generatedImages] = await Promise.all([
    getDocumentsByEntryId(entryId),
    getUserGeneratedImages(access.entry.userId!, entryId),
  ]);

  return (
    <DashboardShell
      sidebarContent={
        <EntrySidebar
          entryId={entryId}
          obituaries={obituaries}
          generatedImages={generatedImages}
          canEdit={access.canEdit}
        />
      }
    >
      {children}
    </DashboardShell>
  );
}
