"use client";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { obitLimit } from "@/lib/config";
import { Document } from "@/lib/db/schema";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";

interface ObituaryListModalProps {
  entryId: string;
  obituaries: Document[];
  canEdit: boolean;
  children: React.ReactNode;
}

export const ObituaryListModal = ({
  entryId,
  obituaries,
  canEdit,
  children,
}: ObituaryListModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="mdi:file-document-outline" className="w-5 h-5" />
            Obituaries ({obituaries.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {obituaries.length > 0 ? (
            <>
              <div className="space-y-2 max-h-60 overflow-y-auto scroll-style">
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
                        {obituary.content && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {obituary.content.substring(0, 150)}...
                          </p>
                        )}
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
                          })}
                        >
                          <Icon icon="mdi:pencil" className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
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
      </DialogContent>
    </Dialog>
  );
};
