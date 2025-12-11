import { ObituaryComments } from "@/components/sections/obituaries/comments-panel";
import { DynamicChat } from "@/components/sections/obituaries/dynamic-chat";
import { DynamicCommentingSettings } from "@/components/sections/obituaries/dynamic-commenting-settings";
import { ObituaryViewerWithComments } from "@/components/sections/obituaries/obituary-viewer-with-comments";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { getDocumentWithAccess, listDocumentComments } from "@/lib/db/queries";
import {
  getChatByDocumentId,
  getMessagesByChatId,
} from "@/lib/db/queries/chats";
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { format } from "date-fns";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

// Caching handled by "use cache" in query functions with on-demand revalidation via tags

type PageParams = Promise<{ entryId: string; id: string }>;

const roleLabel = (role: string) => {
  switch (role) {
    case "owner":
      return "Owner";
    case "commenter":
      return "Commenter";
    default:
      return "Viewer";
  }
};

const toSerializableComments = (comments: Awaited<
  ReturnType<typeof listDocumentComments>
>) =>
  comments.map((item) => ({
    id: item.comment.id,
    userId: item.comment.userId,
    content: item.comment.content,
    parentId: item.comment.parentId,
    createdAt: item.comment.createdAt.toISOString(),
    updatedAt: item.comment.updatedAt.toISOString(),
    // Anchor fields for text-anchored comments
    anchorStart: item.comment.anchorStart,
    anchorEnd: item.comment.anchorEnd,
    anchorText: item.comment.anchorText,
    anchorPrefix: item.comment.anchorPrefix,
    anchorSuffix: item.comment.anchorSuffix,
    anchorValid: item.comment.anchorValid,
    anchorStatus: item.comment.anchorStatus,
    author: {
      id: item.author.id,
      name: item.author.name,
      email: item.author.email,
      imageUrl: item.author.imageUrl,
    },
  }));

export default async function ObituaryPage({
  params,
}: {
  params: PageParams;
}) {
  const { entryId, id } = await params;
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect_url=/${entryId}/obituaries/${id}`);
  }

  // Get document access (includes role and permissions)
  const access = await getDocumentWithAccess({
    documentId: id,
    userId,
    orgId,
  });

  if (!access || access.document.entryId !== entryId) {
    notFound();
  }

  // Get entry access
  const entryAccess = await getEntryWithAccess(entryId);

  if (!entryAccess || !entryAccess.canView) {
    notFound();
  }

  const entry = entryAccess.entry;
  const isOwner = access.role === "owner";

  const clerk = await clerkClient();

  // Parallel data fetching based on role
  const [comments, user, chatData] = await Promise.all([
    listDocumentComments({
      documentId: access.document.id,
      documentCreatedAt: access.document.createdAt,
    }),
    clerk.users.getUser(userId),
    // Only fetch chat data for owners
    isOwner
      ? getChatByDocumentId({
          documentId: access.document.id,
          documentCreatedAt: access.document.createdAt,
          userId,
        }).then(async (chat) => ({
          chat,
          messages: chat ? await getMessagesByChatId({ id: chat.id }) : [],
        }))
      : Promise.resolve({ chat: null, messages: [] }),
  ]);

  const currentUser = {
    id: user.id,
    name: user.fullName ?? user.username ?? user.emailAddresses[0]?.emailAddress ?? null,
    email: user.emailAddresses[0]?.emailAddress ?? null,
    imageUrl: user.imageUrl ?? null,
  };

  const canModerate = isOwner;

  // Organization settings logic
  const documentHasOrganization = Boolean(access.document.organizationId);
  const ownerHasActiveOrg = Boolean(orgId);
  const organizationMatchesUser =
    documentHasOrganization && access.document.organizationId === orgId;
  const canModifyCommenting = documentHasOrganization
    ? organizationMatchesUser
    : ownerHasActiveOrg;

  const commentingDisabledReason = canModifyCommenting
    ? null
    : documentHasOrganization
      ? "Switch to the organization associated with this obituary in Clerk to update commenting access."
      : "Join or create an organization in Clerk to share commenting access.";

  let organizationMemberCount = 0;
  let organizationInContext = false;

  if (isOwner) {
    const organizationForSharing =
      access.document.organizationId ?? orgId ?? null;

    if (organizationForSharing) {
      organizationInContext = true;

      try {
        const memberships =
          await clerk.organizations.getOrganizationMembershipList({
            organizationId: organizationForSharing,
            limit: 200,
          });

        organizationMemberCount = memberships.data?.length ?? 0;
      } catch (error) {
        console.error(
          "Failed to load organization membership list",
          error
        );
      }
    }
  }

  const backHref = `/${entry.id}`;
  const createdAtLabel = format(
    access.document.createdAt,
    "MMM d, yyyy 'at' h:mm a"
  );

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
          })}
        >
          <Icon icon="mdi:arrow-left" className="mr-2 size-4" />
          Back to entry
        </Link>
        <Badge variant="secondary">{roleLabel(access.role)}</Badge>
      </div>

      {/* Main Content Grid - Two Column Layout */}
      <div className="grid gap-6 xl:grid-cols-[1fr_480px] 3xl:grid-cols-[1fr_640px]">
        {/* Left Column - Obituary Viewer (Wider) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {isOwner ? "Edit & Review" : "Memorial Overview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <ObituaryViewerWithComments
                key={`${access.document.id}-${(access.document.content ?? "").length}`}
                documentId={access.document.id}
                entryId={entryId}
                content={access.document.content ?? ""}
                canComment={access.canComment}
                canEdit={isOwner}
                entryName={entry.name}
                createdAt={access.document.createdAt}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Right Column - Sidebar with Details, Comments & Settings */}
        <div className="space-y-6">
          {/* Obituary Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon icon="mdi:information-outline" className="size-5" />
                {access.document.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-foreground">Honoring</span>
                  <p className="text-muted-foreground mt-1">{entry.name}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">Created</span>
                  <p className="text-muted-foreground mt-1">{createdAtLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Panel */}
          <Card>
            <CardContent className="py-6">
              <ObituaryComments
                documentId={access.document.id}
                canComment={access.canComment}
                canModerate={canModerate}
                currentUser={currentUser}
                initialComments={toSerializableComments(comments)}
              />
            </CardContent>
          </Card>

          {/* Owner-only: Commenting Settings */}
          {isOwner &&
            (documentHasOrganization || ownerHasActiveOrg) && (
              <Card>
                <CardContent className="py-6">
                  <DynamicCommentingSettings
                    documentId={access.document.id}
                    initialEnabled={
                      access.document.organizationCommentingEnabled
                    }
                    canModify={canModifyCommenting}
                    disabledReason={commentingDisabledReason}
                    organizationMemberCount={organizationMemberCount}
                    organizationInContext={organizationInContext}
                  />
                </CardContent>
              </Card>
            )}

          {/* Owner-only: Organization Info */}
          {isOwner &&
            !documentHasOrganization &&
            !ownerHasActiveOrg && (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="lucide:shield-alert"
                      className="mt-1 size-5 text-primary"
                    />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">
                        Collaboration requires an organization
                      </h4>
                      <p>
                        Create or join an organization in to extend
                        commenting access to your teammates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>

      {/* Owner-only: Floating AI Chat Bubble */}
      {isOwner && (
        <DynamicChat
          access={access}
          chatData={chatData}
        />
      )}
    </main>
  );
}
