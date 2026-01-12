import { getSharedDocumentByToken } from "@/lib/db/queries/share-links";
import { incrementShareLinkViewCount } from "@/lib/db/mutations/share-links";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { SharedDocumentViewer } from "@/components/sections/share/shared-document-viewer";
import { GuestCommentSection } from "@/components/sections/share/guest-comment-section";
import { getGuestIdentityAction } from "@/actions/guest-comments";

type PageParams = Promise<{ token: string }>;

export async function generateMetadata({ params }: { params: PageParams }) {
  const { token } = await params;
  const data = await getSharedDocumentByToken(token);

  if (!data) {
    return {
      title: "Shared Document Not Found",
    };
  }

  const entryName = data.entry?.name ?? "Memorial";

  return {
    title: `${data.document.title} - ${entryName}`,
    description: `Shared obituary for ${entryName}`,
  };
}

export default async function SharedDocumentPage({
  params,
}: {
  params: PageParams;
}) {
  const { token } = await params;

  // Get the shared document
  const data = await getSharedDocumentByToken(token);

  if (!data) {
    notFound();
  }

  // Increment view count (fire and forget)
  incrementShareLinkViewCount(token).catch(() => {
    // Ignore errors
  });

  const { shareLink, document, entry } = data;

  // Format dates
  const dateOfBirth = entry?.dateOfBirth
    ? format(new Date(entry.dateOfBirth), "MMMM d, yyyy")
    : null;
  const dateOfDeath = entry?.dateOfDeath
    ? format(new Date(entry.dateOfDeath), "MMMM d, yyyy")
    : null;

  // Get guest identity if comments are enabled
  let guestIdentity = null;
  if (shareLink.allowComments) {
    const result = await getGuestIdentityAction(token);
    if (result.success && result.guest) {
      guestIdentity = result.guest;
    }
  }

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
              Shared Memorial
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Document Card */}
          <div className="rounded-lg border bg-card p-8 shadow-sm">
            <h2 className="mb-6 text-center text-2xl font-semibold">
              {document.title}
            </h2>
            <SharedDocumentViewer content={document.content ?? ""} />
          </div>

          {/* Guest Comments Section */}
          {shareLink.allowComments && (
            <div className="mt-8">
              <GuestCommentSection
                shareLinkToken={token}
                documentId={document.id}
                initialGuestIdentity={guestIdentity}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            This memorial was shared with you privately.
            {shareLink.allowComments && " You can leave your thoughts and condolences below."}
          </p>
        </div>
      </footer>
    </main>
  );
}
