import { CachedImage } from "@/components/elements/image-cache";
import { EntryDetailsCard } from "@/components/sections/entries/details-card";
import { EntryDisplay } from "@/components/sections/entries/entry-display";
import { EntryImageUpload } from "@/components/sections/entries/entry-image-upload";
import { LegacyPlanningCard } from "@/components/sections/entries/legacy-planning-card";
import { SurveyPromptModal } from "@/components/sections/entries/survey-prompt-modal";
import { EntryFeedbackPanel } from "@/components/sections/entry-feedback";
import { FeedbackSkeleton } from "@/components/skeletons/feedback";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { getEntryImages } from "@/lib/db/queries";
import { getUserById } from "@/lib/db/queries/auth";
import { getEntryDetailsById } from "@/lib/db/queries/entries";
import { getPendingFeedbackCounts } from "@/lib/db/queries/entry-feedback";
import { getSurveysByEntryId, getLatestSurveyResponse } from "@/lib/db/queries/pre-need-survey";
import type { Entry, User } from "@/lib/db/schema";
import { format } from "date-fns";
import Link from "next/link";
import { Suspense } from "react";

interface EntryEditContentProps {
  entry: Entry;
  canEdit: boolean;
  role: "owner" | "org_admin" | "org_member";
  isOrgOwner: boolean;
  showSurveyPrompt: boolean;
}

export async function EntryEditContent({
  entry,
  canEdit,
  role,
  isOrgOwner,
  showSurveyPrompt,
}: EntryEditContentProps) {
  const [entryDetails, entryImagesResult, ownerUser, pendingFeedbackByEntryId, surveys] =
    await Promise.all([
      getEntryDetailsById(entry.id),
      getEntryImages(entry.id),
      getUserById(entry.userId),
      getPendingFeedbackCounts([entry.id]),
      getSurveysByEntryId(entry.id),
    ]);

  const pendingFeedbackCount = pendingFeedbackByEntryId[entry.id] ?? 0;

  const approvedSurvey = surveys.find((s) => s.status === "approved");
  const approvedSurveyResponse = approvedSurvey
    ? await getLatestSurveyResponse(approvedSurvey.id)
    : null;

  const entryImages = entryImagesResult.success
    ? entryImagesResult.images || []
    : [];

  const lastEditedBy: User | null = ownerUser ?? null;
  const ownerName = ownerUser?.name ?? ownerUser?.email ?? "Unknown user";
  const lastEditedName =
    lastEditedBy?.name ?? lastEditedBy?.email ?? "Unknown user";

  return (
    <div className="space-y-8 loading-fade">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        {role === "org_member" && (
          <Badge variant="outline" className="flex items-center gap-1.5">
            <Icon icon="mdi:account-group" className="w-4 h-4" />
            Team Entry (View Only)
          </Badge>
        )}
      </div>

      <div className="grid xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="@container">
              <div className="grid md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] 2xl:grid-cols-[400px_1fr] gap-6">
                {entry.image && (
                  <figure className="relative w-full aspect-square rounded-lg overflow-hidden border">
                    <CachedImage
                      src={entry.image}
                      alt={entry.name}
                      height={1280}
                      width={1280}
                      className="w-full h-full object-cover"
                    />
                  </figure>
                )}
                <div className="flex-1">
                  {!canEdit && (
                    <div className="p-4 bg-muted/50 rounded-lg border border-border mb-4">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Icon icon="mdi:information-outline" className="w-4 h-4" />
                        You have view-only access to this entry. Only the creator can make edits.
                      </p>
                    </div>
                  )}
                  <EntryDisplay
                    entry={entry}
                    canEdit={canEdit}
                    isOrgOwner={isOrgOwner}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <EntryDetailsCard entry={entry} entryDetails={entryDetails!} canEdit={canEdit} isOrgOwner={isOrgOwner} />
          </div>

          {approvedSurvey && approvedSurveyResponse && (
            <div className="mt-6">
              <LegacyPlanningCard
                entryId={entry.id}
                surveyId={approvedSurvey.id}
                surveyResponse={approvedSurveyResponse}
                canEdit={canEdit}
              />
            </div>
          )}

          {canEdit && (
            <div className="mt-4 xl:hidden">
              <Button
                asChild={!!entryDetails}
                disabled={!entryDetails}
                className="w-full"
                size="lg"
              >
                {entryDetails ? (
                  <Link href={`/${entry.id}/obituaries/create`}>
                    <Icon icon="mdi:file-document-plus" className="w-5 h-5 mr-2" />
                    Create Obituary
                  </Link>
                ) : (
                  <>
                    <Icon icon="mdi:file-document-plus" className="w-5 h-5 mr-2" />
                    Create Obituary
                  </>
                )}
              </Button>
              {!entryDetails && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Add obituary details above to create an obituary
                </p>
              )}
            </div>
          )}

          <div className="mt-6">
            <Suspense fallback={<FeedbackSkeleton />}>
              <EntryFeedbackPanel entryId={entry.id} />
            </Suspense>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon icon="mdi:information-outline" className="w-4 h-4" />
                Entry Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit && pendingFeedbackCount > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50/70 px-3 py-2 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100">
                  <div className="flex items-center gap-2 font-medium">
                    <Icon icon="mdi:comment-alert" className="w-4 h-4 shrink-0" />
                    <span>
                      {pendingFeedbackCount} pending{" "}
                      {pendingFeedbackCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>
              )}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">Created</dt>
                  <dd className="font-medium">{format(new Date(entry.createdAt), "MMM d, yyyy")}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">Updated</dt>
                  <dd className="font-medium">{format(new Date(entry.updatedAt), "MMM d, yyyy")}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">Owner</dt>
                  <dd className="font-medium truncate">{ownerName}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:image-multiple" className="w-5 h-5" aria-hidden="true" />
                Photos & Images ({entryImages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {canEdit ? (
                  <p className="text-sm text-muted-foreground">
                    Upload and manage photos for {entry.name}&apos;s memorial.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Photos uploaded for {entry.name}&apos;s memorial.
                  </p>
                )}
                <EntryImageUpload
                  entryId={entry.id}
                  initialImages={entryImages}
                  readOnly={!canEdit}
                  currentPrimaryImage={entry.image ?? undefined}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showSurveyPrompt && canEdit && (
        <SurveyPromptModal entryId={entry.id} entryName={entry.name} />
      )}
    </div>
  );
}
