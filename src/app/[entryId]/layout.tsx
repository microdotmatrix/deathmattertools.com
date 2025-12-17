import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getDocumentsByEntryId } from "@/lib/db/queries/documents";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import { getUserGeneratedImages } from "@/lib/db/queries/media";
import { format } from "date-fns";
import Link from "next/link";
import { ReactNode } from "react";
import { notFound } from "next/navigation";

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

  return (
    <DashboardShell
      sidebarContent={
        <EntrySidebarContent
          entryId={entryId}
          entryName={entry.name}
          canEdit={canEdit}
          obituaries={obituaries}
          generatedImages={generatedImages}
        />
      }
    >
      {children}
    </DashboardShell>
  );
}

type EntrySidebarContentProps = {
  entryId: string;
  entryName: string;
  canEdit: boolean;
  obituaries: Array<{ id: string; title: string | null; createdAt: Date }>;
  generatedImages: Array<{
    id: string;
    epitaphId: number | null;
    createdAt: Date;
    status: string;
  }>;
};

function EntrySidebarContent({
  entryId,
  entryName,
  canEdit,
  obituaries,
  generatedImages,
}: EntrySidebarContentProps) {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Memorial Images</SidebarGroupLabel>
        <div className="space-y-3">
          {generatedImages.length > 0 ? (
            <SidebarMenu>
              {generatedImages.slice(0, 4).map((image) => (
                <SidebarMenuItem key={image.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/${entryId}/images`}>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">
                          Memorial Image {image.epitaphId ?? ""}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(image.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <span className="ml-auto text-[11px] font-semibold uppercase text-green-700">
                        {image.status}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : (
            <p className="text-xs text-muted-foreground">
              No memorial images yet.
            </p>
          )}
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href={`/${entryId}/images`} aria-label="View all memorial images">
                <Icon icon="mdi:eye" className="w-4 h-4 mr-2" />
                View All
              </Link>
            </Button>
            {canEdit && (
              <Button asChild variant="secondary" size="sm" className="w-full">
                <Link
                  href={`/${entryId}/images/create`}
                  aria-label="Create memorial image"
                >
                  <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                  Create
                </Link>
              </Button>
            )}
          </div>
        </div>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Obituaries</SidebarGroupLabel>
        <div className="space-y-3">
          {obituaries.length > 0 ? (
            <SidebarMenu>
              {obituaries.map((obituary) => (
                <SidebarMenuItem key={obituary.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/${entryId}/obituaries/${obituary.id}`}>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">
                          {obituary.title || `${entryName} Obituary`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(obituary.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : (
            <p className="text-xs text-muted-foreground">No obituaries created yet.</p>
          )}
          {canEdit && (
            <div className="flex gap-2">
              <Button asChild variant="secondary" size="sm" className="w-full">
                <Link
                  href={`/${entryId}/obituaries/create`}
                  aria-label="Create obituary"
                >
                  <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                  Create
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SidebarGroup>
    </>
  );
}
