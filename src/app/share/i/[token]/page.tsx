import { getSharedImageByToken } from "@/lib/db/queries/share-links";
import { incrementShareLinkViewCount } from "@/lib/db/mutations/share-links";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";

type PageParams = Promise<{ token: string }>;

export async function generateMetadata({ params }: { params: PageParams }) {
  const { token } = await params;
  const data = await getSharedImageByToken(token);

  if (!data) {
    return {
      title: "Shared Image Not Found",
    };
  }

  const entryName = data.entry?.name ?? "Memorial";

  return {
    title: `Memorial Image - ${entryName}`,
    description: `Shared memorial image for ${entryName}`,
  };
}

export default async function SharedImagePage({
  params,
}: {
  params: PageParams;
}) {
  const { token } = await params;

  // Get the shared image
  const data = await getSharedImageByToken(token);

  if (!data) {
    notFound();
  }

  // Increment view count (fire and forget)
  incrementShareLinkViewCount(token).catch(() => {
    // Ignore errors
  });

  const { image, entry } = data;

  // Format dates
  const dateOfBirth = entry?.dateOfBirth
    ? format(new Date(entry.dateOfBirth), "MMMM d, yyyy")
    : null;
  const dateOfDeath = entry?.dateOfDeath
    ? format(new Date(entry.dateOfDeath), "MMMM d, yyyy")
    : null;

  // Get the full image URL
  const imageUrl = image.imageUrl;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {entry?.image && (
                <img
                  src={entry.image}
                  alt={entry.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="font-semibold text-lg">{entry?.name ?? "Memorial"}</h1>
                {dateOfBirth && dateOfDeath && (
                  <p className="text-sm text-muted-foreground">
                    {dateOfBirth} - {dateOfDeath}
                  </p>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Shared Memorial Image
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Image Card */}
          <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={`Memorial image for ${entry?.name ?? "the deceased"}`}
                  className="w-full"
                />
                {/* Download button */}
                <div className="absolute bottom-4 right-4">
                  <Button asChild variant="secondary" size="sm">
                    <a href={imageUrl} download target="_blank" rel="noopener noreferrer">
                      <Icon icon="mdi:download" className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center bg-muted">
                <p className="text-muted-foreground">Image not available</p>
              </div>
            )}
          </div>

          {/* Memorial Info */}
          {entry && (
            <div className="mt-6 text-center">
              <h2 className="text-xl font-semibold">
                In Loving Memory of {entry.name}
              </h2>
              {dateOfBirth && dateOfDeath && (
                <p className="mt-2 text-muted-foreground">
                  {dateOfBirth} - {dateOfDeath}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>This memorial image was shared with you privately.</p>
        </div>
      </footer>
    </main>
  );
}
