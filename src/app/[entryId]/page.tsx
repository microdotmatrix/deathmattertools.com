import { CachedImage } from "@/components/elements/image-cache";
import { SavedQuotesList } from "@/components/quotes-scripture/saved-quotes-list";
import { CollapsibleSection } from "@/components/sections/entries/collapsible-section";
import { EntryDetailsSection } from "@/components/sections/entries/details-card";
import { EntryDetailsDialog } from "@/components/sections/entries/details-dialog";
import { EntryDisplay } from "@/components/sections/entries/entry-display";
import { EntryImageUpload } from "@/components/sections/entries/entry-image-upload";
import { ObituaryList } from "@/components/sections/entries/obituary-list";
import { EntryFeedbackPanel } from "@/components/sections/entry-feedback";
import { EntryEditContentSkeleton } from "@/components/skeletons/entry";
import { FeedbackSkeleton } from "@/components/skeletons/feedback";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { getEntryImages } from "@/lib/db/queries";
import { getUserById } from "@/lib/db/queries/auth";
import { getDocumentsByEntryId } from "@/lib/db/queries/documents";
import { getEntryDetailsById, getEntryWithAccess } from "@/lib/db/queries/entries";
import { getUserGeneratedImages } from "@/lib/db/queries/media";
import { getSavedQuotesByEntryId } from "@/lib/db/queries/quotes";
import type { Entry, User, UserUpload } from "@/lib/db/schema";
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

  // Fetch all data in parallel for better performance
  const [obituaries, generatedImages, entryDetails, entryImagesResult, savedQuotes] = await Promise.all([
    getDocumentsByEntryId(entryId),
    getUserGeneratedImages(entry.userId!, entryId),
    getEntryDetailsById(entry.id),
    getEntryImages(entry.id),
    getSavedQuotesByEntryId(entryId),
  ]);

  const entryImages = entryImagesResult.success ? entryImagesResult.images || [] : [];

  return (
    <Suspense fallback={<EntryEditContentSkeleton />}>
      <EntryEditContent
        entry={entry}
        obituaries={obituaries}
        generatedImages={generatedImages}
        entryDetails={entryDetails}
        entryImages={entryImages}
        savedQuotes={savedQuotes}
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
  entryDetails,
  entryImages,
  savedQuotes,
  canEdit,
  role,
  isOrgOwner,
}: {
  entry: Entry;
  obituaries: any[];
  generatedImages: any[];
  entryDetails: any;
  entryImages: UserUpload[];
  savedQuotes: any[];
  canEdit: boolean;
  role: "owner" | "org_admin" | "org_member";
  isOrgOwner: boolean;
}) => {
  const ownerUser = await getUserById(entry.userId);
  const lastEditedBy: User | null = ownerUser ?? null;
  const ownerName = ownerUser?.name ?? ownerUser?.email ?? "Unknown user";
  const lastEditedName = lastEditedBy?.name ?? lastEditedBy?.email ?? "Unknown user";

  // Create a unified images array that includes the primary/header image
  const allImages: UserUpload[] = [];

  // Add primary image if it exists and is not already in entryImages
  if (entry.image) {
    const primaryImageExists = entryImages.some(img => img.url === entry.image);
    if (!primaryImageExists) {
      // Synthesize a UserUpload object for the primary image
      allImages.push({
        id: 'primary',
        userId: entry.userId,
        entryId: entry.id,
        url: entry.image,
        key: 'primary',
        isPrimary: true,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      });
    }
  }

  // Add all other uploaded images
  allImages.push(...entryImages);

  const totalImagesCount = allImages.length;

  return (
    <div className="space-y-6 loading-fade">
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

      {/* Commemoration Entry - Always Expanded (Non-Collapsible) */}
      <Card>
        <CardContent className="@container p-6">
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

      {/* Obituary Details (edit) - Collapsible */}
      <CollapsibleSection
        title="Obituary Details"
        icon="mdi:file-document-edit-outline"
        defaultOpen={false}
      >
        <div className="space-y-4">
          {canEdit && (
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Extended biographical information for {entry.name}
                </p>
                {isOrgOwner && (
                  <Badge variant="outline">
                    <Icon icon="mdi:shield-account" className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <EntryDetailsDialog entry={entry} initialData={entryDetails!} isOrgOwner={isOrgOwner} />
            </div>
          )}
          <EntryDetailsSection entryDetails={entryDetails!} />
        </div>
      </CollapsibleSection>

      {/* [NAME] Obituaries (#) - Collapsible */}
      <CollapsibleSection
        title={`${entry.name} Obituaries`}
        icon="mdi:file-document-outline"
        count={obituaries.length}
        defaultOpen={false}
      >
        <ObituaryList obituaries={obituaries} entryId={entry.id} canEdit={canEdit} />
      </CollapsibleSection>

      {/* Photos and Images (#) - Collapsible */}
      <CollapsibleSection
        title="Photos and Images"
        icon="mdi:image-multiple"
        count={totalImagesCount}
        defaultOpen={false}
      >
        <div className="space-y-4">
          {canEdit ? (
            <p className="text-sm text-muted-foreground">
              Upload and manage photos for {entry.name}'s memorial. The primary image is used as the main display image.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Photos uploaded for {entry.name}'s memorial.
            </p>
          )}
          <EntryImageUpload
            entryId={entry.id}
            initialImages={allImages}
            readOnly={!canEdit}
            currentPrimaryImage={entry.image ?? undefined}
          />
        </div>
      </CollapsibleSection>

      {/* Saved Quotes and Scripture (#) - Collapsible */}
      <CollapsibleSection
        title="Saved Quotes and Scripture"
        icon="mdi:format-quote-close"
        count={savedQuotes.length}
        defaultOpen={false}
      >
        <Suspense fallback={<SavedQuotesSkeleton />}>
          <SavedQuotesList entryId={entry.id} />
        </Suspense>
      </CollapsibleSection>

      {/* Memorial Documents (#) - Collapsible */}
      <CollapsibleSection
        title="Memorial Documents"
        icon="mdi:file-document-multiple-outline"
        count={generatedImages.length}
        defaultOpen={false}
      >
        <div className="space-y-3">
          {generatedImages && generatedImages.length > 0 ? (
            <>
              <div className="space-y-2">
                {generatedImages.slice(0, 5).map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                        <Icon
                          icon="mdi:file-image-outline"
                          className="w-6 h-6 text-muted-foreground"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Memorial Document #{image.epitaphId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(image.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {image.status}
                    </Badge>
                  </div>
                ))}
              </div>
              {generatedImages.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2 border-t">
                  +{generatedImages.length - 5} more documents
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Link
                  href={`/${entry.id}/images`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "flex-1",
                  })}
                  aria-label="View all memorial documents"
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
                  aria-label="Create new memorial document"
                >
                  <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                  Create New
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                No memorial documents created yet.
              </p>
              <Link
                href={`/${entry.id}/images/create`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full",
                })}
                aria-label="Create memorial document"
              >
                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                Create Memorial Document
              </Link>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Entry Feedback and Collaboration - Collapsible */}
      <CollapsibleSection
        title="Entry Feedback and Collaboration"
        icon="mdi:comment-multiple-outline"
        defaultOpen={false}
      >
        <Suspense fallback={<FeedbackSkeleton />}>
          <EntryFeedbackPanel entryId={entry.id} />
        </Suspense>
      </CollapsibleSection>

      {/* Entry Info - Collapsible */}
      <CollapsibleSection
        title="Entry Info"
        icon="mdi:information-outline"
        defaultOpen={false}
      >
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-muted-foreground mb-1">Created</p>
              <p>{format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1">Last Updated</p>
              <p>{format(new Date(entry.updatedAt), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1">Owned by</p>
              <p>{ownerName}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1">Last Edited By</p>
              <p>{lastEditedName}</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>
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
