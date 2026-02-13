import { SavedQuotesList } from "@/components/quotes-scripture/saved-quotes-list";
import { EntrySurveySidebarSection } from "@/components/sections/entries/entry-survey-sidebar-section";
import { ObituaryListItem } from "@/components/sections/entries/obituary-list";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Icon } from "@/components/ui/icon";
import {
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { obitLimit } from "@/lib/config";
import type { DocumentStatus, SurveyStatus } from "@/lib/db/schema";
import { format } from "date-fns";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type SerializedSurvey = {
  id: string;
  entryId: string;
  userId: string;
  organizationId: string | null;
  title: string | null;
  status: SurveyStatus;
  completionPercentage: number;
  currentStep: number | null;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
  statusChangedAt: string | null;
  lockedAt: string | null;
  lastClientAccessAt: string | null;
};

type EntrySidebarContentProps = {
  entryId: string;
  entryName: string;
  canEdit: boolean;
  obituaries: Array<{
    id: string;
    title: string | null;
    createdAt: string;
    isPublic: boolean;
    status: DocumentStatus;
  }>;
  pendingCommentCounts?: Record<string, number>;
  generatedImages: Array<{
    id: string;
    epitaphId: number | null;
    createdAt: string;
    status: string;
  }>;
  surveys: SerializedSurvey[];
};

export const EntrySidebarContent = ({
  entryId,
  entryName,
  canEdit,
  obituaries,
  pendingCommentCounts,
  generatedImages,
  surveys,
}: EntrySidebarContentProps) => {
  const pendingCounts = pendingCommentCounts ?? {};
  return (
    <>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center gap-2">
              <Icon icon="mdi:format-list-bulleted" className="size-4" />
              Obituaries
              <ChevronDown className="mr-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          {canEdit && (
            <SidebarGroupAction asChild title={obituaries.length < obitLimit ? "Create Obituary" : "Obituary Limit Reached"}>
              {obituaries.length < obitLimit ? (
                <Link href={`/${entryId}/obituaries/create`}>
                  <Plus />
                  <span className="sr-only">Create obituary</span>
                </Link>
              ): (
                <span className="opacity-50 cursor-not-allowed">
                  <Plus />
                  <span className="sr-only">Obituary Limit Reached</span>
                </span>
              )}
            </SidebarGroupAction>
          )}
          <CollapsibleContent>
            <SidebarGroupContent className="space-y-3">
              {obituaries.length > 0 ? (
                <SidebarMenu>
                  {obituaries.map((obituary) => (
                    <ObituaryListItem
                      key={obituary.id}
                      obituary={obituary}
                      entryId={entryId}
                      canEdit={canEdit}
                      pendingCommentCount={pendingCounts[obituary.id] ?? 0}
                    />
                  ))}
                </SidebarMenu>
              ) : (
                <div className="px-2 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    No obituaries created yet.
                  </p>
                  {canEdit && (
                    <Button asChild variant="default" size="sm" className="w-full">
                      <Link href={`/${entryId}/obituaries/create`}>
                        <Plus className="size-4 mr-2" />
                        Get Started
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center gap-2">
            <Icon icon="mdi:image" className="size-4" />
              Memorial Images
              <ChevronDown className="mr-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          {canEdit && (
            <SidebarGroupAction asChild title="Create memorial image">
              <Link href={`/${entryId}/images/create`}>
                <Plus />
                <span className="sr-only">Create memorial image</span>
              </Link>
            </SidebarGroupAction>
          )}
          <CollapsibleContent>
            <SidebarGroupContent className="space-y-3">
              {generatedImages.length > 0 ? (
                <SidebarMenu>
                  {generatedImages.slice(0, 4).map((image) => (
                    <SidebarMenuItem key={image.id}>
                      <SidebarMenuButton asChild size="lg">
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
                <p className="text-xs text-muted-foreground px-2">
                  No memorial images yet.
                </p>
              )}
              <div className="px-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/${entryId}/images`} aria-label="View all memorial images">
                    <Icon icon="mdi:eye" className="size-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </div>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center gap-2">
              <Icon icon="mdi:format-quote-close" className="size-4" />
              Saved Quotes &amp; Scripture
              <ChevronDown className="mr-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent className="space-y-3">
              <Suspense fallback={<SavedQuotesSkeleton />}>
                <SavedQuotesList entryId={entryId} />
              </Suspense>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

      <EntrySurveySidebarSection
        entryId={entryId}
        entryName={entryName}
        surveys={surveys}
        canEdit={canEdit}
      />
    </>
  );
};

function SavedQuotesSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse mb-3" />
      <div className="h-4 w-40 bg-muted animate-pulse mb-2" />
      <div className="h-4 w-28 bg-muted animate-pulse mb-3" />
      <div className="h-8 w-full bg-muted animate-pulse rounded-md" />
    </div>
  );
}
