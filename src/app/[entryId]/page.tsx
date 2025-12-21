import { CachedImage } from "@/components/elements/image-cache";
import { EntryDetailsCard } from "@/components/sections/entries/details-card";
import { EntryDisplay } from "@/components/sections/entries/entry-display";
import { EntryImageUpload } from "@/components/sections/entries/entry-image-upload";
import { EntryFeedbackPanel } from "@/components/sections/entry-feedback";
import { EntryEditContentSkeleton } from "@/components/skeletons/entry";
import { FeedbackSkeleton } from "@/components/skeletons/feedback";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { getEntryImages } from "@/lib/db/queries";
import { getUserById } from "@/lib/db/queries/auth";
import { getEntryDetailsById, getEntryWithAccess } from "@/lib/db/queries/entries";
import type { Entry, User } from "@/lib/db/schema";
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

  return (
    <Suspense fallback={<EntryEditContentSkeleton />}>
      <EntryEditContent
        entry={entry}
        canEdit={canEdit}
        role={role}
        isOrgOwner={isOrgOwner}
      />
    </Suspense>
  );
}

const EntryEditContent = async ({
  entry,
  canEdit,
  role,
  isOrgOwner,
}: {
  entry: Entry;
  canEdit: boolean;
  role: "owner" | "org_admin" | "org_member";
  isOrgOwner: boolean;
}) => {
  // Fetch entry details and owner in parallel for better performance
  const [entryDetails, entryImagesResult, ownerUser] = await Promise.all([
    getEntryDetailsById(entry.id),
    getEntryImages(entry.id),
    getUserById(entry.userId),
  ]);

  const entryImages = entryImagesResult.success
    ? entryImagesResult.images || []
    : [];

  const lastEditedBy: User | null = ownerUser ?? null; // TODO: replace with real last-editor attribution when available
  const ownerName = ownerUser?.name ?? ownerUser?.email ?? "Unknown user";
  const lastEditedName =
    lastEditedBy?.name ?? lastEditedBy?.email ?? "Unknown user";

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

          {/* Entry Details Section */}
          <div className="mt-6">
            <EntryDetailsCard entry={entry} entryDetails={entryDetails!} canEdit={canEdit} isOrgOwner={isOrgOwner} />
          </div>

          {/* Entry Feedback Section */}
          <div className="mt-6">
            <Suspense fallback={<FeedbackSkeleton />}>
              <EntryFeedbackPanel entryId={entry.id} />
            </Suspense>
          </div>
        </div>

        {/* Additional Entry Content - Takes up 1/3 */}
        <div className="space-y-6">
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
                <div>
                  <span className="font-medium">Owned by:</span>
                  <br />
                  <span className="text-muted-foreground">
                    {ownerName}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Last Edited By:</span>
                  <br />
                  <span className="text-muted-foreground">
                    {lastEditedName}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    currentPrimaryImage={entry.image ?? undefined}
                  />
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};
