import { deleteObituaryAction } from "@/actions/documents";
import { ActionButton } from "@/components/elements/action-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { obitLimit } from "@/lib/config";
import type { Document, DocumentStatus } from "@/lib/db/schema";
import { format } from "date-fns";
import Link from "next/link";

export type ObituaryListItemData = {
  id: string;
  title: string | null;
  createdAt: Date | string;
  isPublic: boolean;
  status: DocumentStatus;
};

export const ObituaryList = ({
  obituaries,
  entryId,
  canEdit,
  pendingCommentCounts = {},
}: {
  obituaries: Document[];
  entryId: string;
  canEdit: boolean;
  pendingCommentCounts?: Record<string, number>;
}) => {
  return (
    <div className="space-y-4">
      {obituaries.length > 0 ? (
        <>
          <div className="space-y-2 max-h-96 overflow-y-auto scroll-style">
            {obituaries.map((obituary) => (
              <ObituaryListItem
                key={obituary.id}
                obituary={obituary}
                entryId={entryId}
                canEdit={canEdit}
                pendingCommentCount={pendingCommentCounts[obituary.id] ?? 0}
              />
            ))}
          </div>
          
          {canEdit && (
            <div className="border-t pt-3">
              {obituaries.length >= obitLimit ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled
                >
                  <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                  Obituary Limit Reached ({obitLimit})
                </Button>
              ) : (
                <Link
                  href={`/${entryId}/obituaries/create`}
                  className={buttonVariants({
                    variant: "default",
                    size: "sm",
                    className: "w-full",
                  })}
                >
                  <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                  Create New Obituary
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <Icon icon="mdi:file-document-outline" className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            No obituaries generated yet.
          </p>
          {canEdit && (
            <Link
              href={`/${entryId}/obituaries/create`}
              className={buttonVariants({
                variant: "default",
                size: "sm",
              })}
            >
              <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
              Create First Obituary
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export const ObituaryListItem = ({
  obituary,
  entryId,
  canEdit,
  pendingCommentCount = 0,
}: {
  obituary: ObituaryListItemData;
  entryId: string;
  canEdit: boolean;
  pendingCommentCount?: number;
}) => {
  return (
    <div
      className="px-3 py-2 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {obituary.title || "Untitled Obituary"}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Created {format(new Date(obituary.createdAt), "MMM d, yyyy")}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <StatusBadge status={obituary.status} showIcon={true} />
            {obituary.isPublic && (
              <Badge variant="secondary" className="text-xs">
                Public
              </Badge>
            )}
            {canEdit && pendingCommentCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      aria-label={`${pendingCommentCount} pending comments`}
                      className="inline-flex size-2.5 rounded-full bg-primary"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {pendingCommentCount} pending{" "}
                      {pendingCommentCount === 1 ? "comment" : "comments"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/${entryId}/obituaries/${obituary.id}`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "size-8 p-0",
            })}
            aria-label={`View obituary: ${obituary.title}`}
          >
            <Icon icon="mdi:eye" className="w-4 h-4" />
          </Link>
          {canEdit && (
            <ActionButton
              action={deleteObituaryAction.bind(null, obituary.id, entryId)}
              requireAreYouSure
              areYouSureDescription={`Are you sure you want to delete ${obituary.title}?`}
              variant="destructive"
              size="sm"
              className="size-8 p-0"
              aria-label={`Delete obituary: ${obituary.title}`}
            >
              <Icon icon="mdi:delete" className="w-4 h-4" />
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  )
}
