import { deleteObituaryAction } from "@/actions/documents";
import { ActionButton } from "@/components/elements/action-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { obitLimit } from "@/lib/config";
import { Document } from "@/lib/db/schema";
import { format } from "date-fns";
import Link from "next/link";

export const ObituaryList = ({ obituaries, entryId, canEdit }: { obituaries: Document[], entryId: string, canEdit: boolean }) => {
  return (
    <div className="space-y-4">
      {obituaries.length > 0 ? (
        <>
          <div className="space-y-2 max-h-96 overflow-y-auto scroll-style">
            {obituaries.map((obituary) => (
              <div
                key={obituary.id}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {obituary.title || "Untitled Obituary"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {format(new Date(obituary.createdAt), "MMM d, yyyy")}
                    </p>
                    
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {obituary.isPublic && (
                      <Badge variant="secondary" className="text-xs">
                        Public
                      </Badge>
                    )}
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