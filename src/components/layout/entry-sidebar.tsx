import { ObituaryList } from "@/components/sections/entries/obituary-list";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { Document, UserGeneratedImage } from "@/lib/db/schema";
import { format } from "date-fns";
import Link from "next/link";

interface EntrySidebarProps {
  entryId: string;
  obituaries: Document[];
  generatedImages: UserGeneratedImage[];
  canEdit: boolean;
}

export function EntrySidebar({
  entryId,
  obituaries,
  generatedImages,
  canEdit,
}: EntrySidebarProps) {
  return (
    <div className="space-y-4">
      <Card className="border-sidebar-border/80 bg-sidebar text-sidebar-foreground shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon icon="mdi:file-document-outline" className="w-4 h-4" aria-hidden="true" />
            Obituaries ({obituaries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ObituaryList obituaries={obituaries} entryId={entryId} canEdit={canEdit} />
        </CardContent>
      </Card>

      <Card className="border-sidebar-border/80 bg-sidebar text-sidebar-foreground shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon icon="mdi:image-multiple-outline" className="w-4 h-4" aria-hidden="true" />
            Memorial Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {generatedImages && generatedImages.length > 0 ? (
              <>
                <div className="space-y-2">
                  {generatedImages.slice(0, 3).map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 p-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-accent">
                          <Icon icon="mdi:image" className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-foreground">
                            Memorial Image #{image.epitaphId}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {format(new Date(image.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                        {image.status}
                      </span>
                    </div>
                  ))}
                </div>
                {generatedImages.length > 3 && (
                  <p className="text-[11px] text-muted-foreground text-center">
                    +{generatedImages.length - 3} more images
                  </p>
                )}
                <div className="flex gap-2">
                  <Link
                    href={`/${entryId}/images`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "flex-1",
                    })}
                    aria-label="View all memorial images"
                  >
                    <Icon icon="mdi:eye" className="mr-2 h-4 w-4" />
                    View All
                  </Link>
                  <Link
                    href={`/${entryId}/images/create`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "flex-1",
                    })}
                    aria-label="Create new memorial image"
                  >
                    <Icon icon="mdi:plus" className="mr-2 h-4 w-4" />
                    Create New
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">No memorial images created yet.</p>
                <Link
                  href={`/${entryId}/images/create`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full",
                  })}
                  aria-label="Create memorial image"
                >
                  <Icon icon="mdi:plus" className="mr-2 h-4 w-4" />
                  Create Memorial Image
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
