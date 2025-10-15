import { OrganizationCommentingSettings } from "@/components/sections/obituaries/commenting-settings";
import { ObituaryComments } from "@/components/sections/obituaries/comments-panel";
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
import { getEntryWithAccess } from "@/lib/db/queries/entries";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { format } from "date-fns";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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

export default async function ObituaryViewPage({
  params,
}: {
  params: PageParams;
}) {
  const { entryId, id } = await params;
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect_url=/${entryId}/obituaries/${id}/view`);
  }

  const access = await getDocumentWithAccess({
    documentId: id,
    userId,
    orgId,
  });

  if (!access || access.document.entryId !== entryId) {
    notFound();
  }

  const entryAccess = await getEntryWithAccess(entryId);

  if (!entryAccess || !entryAccess.canView) {
    notFound();
  }

  const entry = entryAccess.entry;

  const clerk = await clerkClient();

  const [comments, user] = await Promise.all([
    listDocumentComments({
      documentId: access.document.id,
      documentCreatedAt: access.document.createdAt,
    }),
    clerk.users.getUser(userId),
  ]);

  const currentUser = {
    id: user.id,
    name: user.fullName ?? user.username ?? user.emailAddresses[0]?.emailAddress ?? null,
    email: user.emailAddresses[0]?.emailAddress ?? null,
    imageUrl: user.imageUrl ?? null,
  };

  const canModerate = access.role === "owner";
  const canEditObituary = canModerate;

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

  if (access.role === "owner") {
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
  const editHref = `/${entryId}/obituaries/${id}`;

  return (
    <main className="container mx-auto px-4 py-6">
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
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{roleLabel(access.role)}</Badge>
          <span className="text-sm text-muted-foreground">
            Created {createdAtLabel}
          </span>
          {canEditObituary && (
            <Link
              href={editHref}
              className={buttonVariants({ size: "sm" })}
            >
              <Icon icon="mdi:pencil" className="mr-2 size-4" />
              Edit obituary
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:information-outline" className="size-5" />
                Obituary Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-foreground">
                  Title:
                </span>
                <p className="text-muted-foreground">
                  {access.document.title}
                </p>
              </div>
              <div>
                <span className="font-medium text-foreground">
                  Honoring:
                </span>
                <p className="text-muted-foreground">{entry.name}</p>
              </div>
              <div>
                <span className="font-medium text-foreground">
                  Entry ID:
                </span>
                <p className="text-muted-foreground">
                  {entry.id}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                Memorial Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ObituaryViewerWithComments
                documentId={access.document.id}
                content={access.document.content ?? ""}
                canComment={access.canComment}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
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

          {access.role === "owner" &&
            (documentHasOrganization || ownerHasActiveOrg) && (
              <Card>
                <CardContent className="py-6">
                  <OrganizationCommentingSettings
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

          {access.role === "owner" &&
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
                        Create or join an organization in Clerk to extend
                        commenting access to your teammates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </main>
  );
}
