import { EpitaphThumbnail } from "@/components/sections/memorials/images/thumbnail";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getUserGeneratedImages } from "@/lib/db/queries";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import type { UserGeneratedImage } from "@/lib/db/schema";
import { fetchImage } from "@/lib/services/placid";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ entryId: string }>;
}

export default async function ImagesPage({ params }: PageProps) {
  const { entryId } = await params;
  
  // Check access to entry
  const access = await getEntryWithAccess(entryId);
  
  if (!access || !access.canView) {
    notFound();
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PageContent 
        entryId={entryId} 
        userId={access.entry.userId}
        isOwner={access.role === "owner"}
      />
    </Suspense>
  );
}

const PageContent = async ({
  entryId,
  userId,
  isOwner,
}: {
  entryId: string;
  userId: string;
  isOwner: boolean;
}) => {
  // Always fetch images from the owner's collection
  const images = await getUserGeneratedImages(userId, entryId);

  // Group images by date (YYYY-MM-DD format)
  const groupedImages = images.reduce((groups, image) => {
    const date = new Date(image.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(image);
    return groups;
  }, {} as Record<string, typeof images>);

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedImages).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">No images generated yet.</p>
        {isOwner && (
          <Link
            href={`/${entryId}/images/create`}
            className={buttonVariants({
              variant: "default",
              size: "lg",
            })}
          >
            Create Your First Image <Icon icon="mdi:plus" className="ml-2 size-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Most recent images - full width grid at top */}
      {sortedDates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-foreground border-b pb-2">
              {sortedDates[0]}
            </h2>
            {isOwner && (
              <Link
                href={`/${entryId}/images/create`}
                className={buttonVariants({
                  variant: "default",
                  size: "lg",
                  className: "flex items-center gap-2",
                })}
              >
                Create New <Icon icon="mdi:plus" className="size-4" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {groupedImages[sortedDates[0]].map((image) => (
              <figure key={image.id}>
                <Suspense
                  fallback={
                    <div className="size-full aspect-square bg-muted animate-pulse" />
                  }
                >
                  <ImageResult key={image.id} image={image} entryId={entryId} isOwner={isOwner} />
                </Suspense>
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Previous images - 2 column grid below */}
      {sortedDates.length > 1 && (
        <div className="grid md:grid-cols-2 gap-8">
          {sortedDates.slice(1).map((date) => (
            <div key={date} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground border-b pb-2">
                {date}
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {groupedImages[date].map((image) => (
                  <li key={image.id}>
                    <figure>
                      <Suspense
                        fallback={
                          <div className="size-full aspect-square bg-muted animate-pulse" />
                        }
                      >
                        <ImageResult key={image.id} image={image} entryId={entryId} isOwner={isOwner} />
                      </Suspense>
                    </figure>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ImageResult = async ({
  image,
  entryId,
  isOwner,
}: {
  image: UserGeneratedImage;
  entryId: string;
  isOwner: boolean;
}) => {
  const epitaphImage = await fetchImage(image.epitaphId);
  return (
    <EpitaphThumbnail
      image={epitaphImage}
      entryId={entryId}
      imageId={image.id}
      canShare={isOwner}
    />
  );
};