import { CachedImage } from "@/components/elements/image-cache";
import { SavedQuotesList } from "@/components/quotes-scripture/saved-quotes-list";
import { EntryDetailsCard } from "@/components/sections/entries/details-card";
import { EntryDisplay } from "@/components/sections/entries/entry-display";
import { EntryImageUpload } from "@/components/sections/entries/entry-image-upload";
import { ObituaryList } from "@/components/sections/entries/obituary-list";
import { EntryFeedbackPanel } from "@/components/sections/entry-feedback";
import { EntryEditContentSkeleton } from "@/components/skeletons/entry";
import { FeedbackSkeleton } from "@/components/skeletons/feedback";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { getEntryImages } from "@/lib/db/queries";
import { getDocumentsByEntryId } from "@/lib/db/queries/documents";
import { getEntryDetailsById, getEntryWithAccess } from "@/lib/db/queries/entries";
import { getUserGeneratedImages } from "@/lib/db/queries/media";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ entryId: string }>;
}

export default async function EntryEditPage({ params }: PageProps) {
  const { entryId } = await params;
  const access = await getEntryWithAccess(entryId);

  if (!access || !access.canView) {
    notFound();
  }

  const { entry, canEdit, role, isOrgOwner } = access;

  // Fetch obituaries for this deceased person
  const obituaries = await getDocumentsByEntryId(entryId);

  // Fetch generated images for this deceased person
  const generatedImages = await getUserGeneratedImages(entry.userId!, entryId);

  return (
    <Suspense fallback={<EntryEditContentSkeleton />}>
      <EntryEditContent
        entry={entry}
        obituaries={obituaries}
        generatedImages={generatedImages}
        canEdit={canEdit}
        role={role}
        isOrgOwner={isOrgOwner}
      />
    </Suspense>
  );
}

const EntryEditContent = async ({
  entry,
  obituaries,
  generatedImages,
  canEdit,
  role,
  isOrgOwner,
}: {
  entry: any;
  obituaries: any[];
  generatedImages: any[];
  canEdit: boolean;
  role: "owner" | "org_admin" | "org_member";
  isOrgOwner: boolean;
}) => {
  // Fetch entry details and images in parallel for better performance
  const [entryDetails, entryImagesResult] = await Promise.all([
    getEntryDetailsById(entry.id),
    getEntryImages(entry.id),
  ]);
  const entryImages = entryImagesResult.success
    ? entryImagesResult.images || []
    : [];

  return (
    <div className="space-y-8 loading-fade">
      {/* Header */}
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
        {/* Main Edit Form - Takes up 2/3 */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Commemoration Entry</CardTitle>
            </CardHeader>
            <CardContent className="@container">
              <div className="grid md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] 2xl:grid-cols-[400px_1fr] gap-6">
                {/* Entry Image - Left side on desktop, top on mobile */}
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
                
                {/* Entry Details - Right side on desktop, bottom on mobile */}
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

          {/* Obituary Details Section */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Obituary Details Card */}
            <EntryDetailsCard entry={entry} entryDetails={entryDetails!} canEdit={canEdit} isOrgOwner={isOrgOwner} />

            {/* Photos & Images Card */}
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
                      Upload and manage photos for {entry.name}'s memorial.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Photos uploaded for {entry.name}'s memorial.
                    </p>
                  )}
                  <EntryImageUpload
                    entryId={entry.id}
                    initialImages={entryImages}
                    readOnly={!canEdit}
                    currentPrimaryImage={entry.image}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entry Feedback Section */}
          <div className="mt-6">
            <Suspense fallback={<FeedbackSkeleton />}>
              <EntryFeedbackPanel entryId={entry.id} />
            </Suspense>
          </div>
        </div>

        {/* Generated Content Sections - Takes up 1/3 */}
        <div className="space-y-6">
          {/* Generated Obituaries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:file-document-outline" className="w-5 h-5" aria-hidden="true" />
                Obituaries ({obituaries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              
                <ObituaryList obituaries={obituaries} entryId={entry.id} canEdit={canEdit} />
                
            </CardContent>
          </Card>

          {/* Memorial Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:image-multiple-outline" className="w-5 h-5" aria-hidden="true" />
                Memorial Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generatedImages && generatedImages.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {generatedImages.slice(0, 3).map((image) => (
                        <div
                          key={image.id}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                              <Icon
                                icon="mdi:image"
                                className="w-6 h-6 text-gray-400"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Memorial Image #{image.epitaphId}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(image.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            {image.status}
                          </div>
                        </div>
                      ))}
                    </div>
                    {generatedImages.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{generatedImages.length - 3} more images
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Link
                        href={`/${entry.id}/images`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className: "flex-1",
                        })}
                        aria-label="View all memorial images"
                      >
                        <Icon icon="mdi:eye" className="w-4 h-4 mr-2" />
                        View All
                      </Link>
                      <Link
                        href={`/${entry.id}/images/create`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className: "flex-1",
                        })}
                        aria-label="Create new memorial image"
                      >
                        <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                        Create New
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      No memorial images created yet.
                    </p>
                    <Link
                      href={`/${entry.id}/images/create`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "w-full",
                      })}
                      aria-label="Create memorial image"
                    >
                      <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                      Create Memorial Image
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Saved Quotes & Scripture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:format-quote-close" className="w-5 h-5" />
                Saved Quotes & Scripture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SavedQuotesSkeleton />}>
                <SavedQuotesList entryId={entry.id} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Entry Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:information-outline" className="w-5 h-5" />
                Entry Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Created:</span>
                  <br />
                  <span className="text-muted-foreground">
                    {format(
                      new Date(entry.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <br />
                  <span className="text-muted-foreground">
                    {format(
                      new Date(entry.updatedAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function SavedQuotesSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-muted animate-pulse mb-4"></div>
      <div className="h-4 w-48 bg-muted animate-pulse mb-2"></div>
      <div className="h-4 w-32 bg-muted animate-pulse mb-4"></div>
      <div className="h-8 w-28 bg-muted animate-pulse rounded-md"></div>
    </div>
  );
}
