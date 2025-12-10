"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Document } from "@/lib/db/schema";
import Link from "next/link";
import { ObituaryListModal } from "./obituary-list-modal";

interface ObituaryActionsButtonProps {
  entryId: string;
  obituaries?: Document[];
  canEdit: boolean;
}

export const ObituaryActionsButton = ({
  entryId,
  obituaries = [],
  canEdit,
}: ObituaryActionsButtonProps) => {
  const hasObituaries = obituaries.length > 0;

  if (!canEdit) {
    return null;
  }

  if (hasObituaries) {
    return (
      <ObituaryListModal
        entryId={entryId}
        obituaries={obituaries}
        canEdit={canEdit}
      >
        <Button
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Icon icon="mdi:file-document-edit-outline" className="size-4" />
            Manage Obituaries
        </Button>
      </ObituaryListModal>
    );
  }

  return (
    <Link
      href={`/${entryId}/obituaries/create`}
      className={buttonVariants({
        variant: "secondary",
        className: "flex items-center gap-2",
      })}
    >
      <Icon icon="mdi:plus" className="size-4" /> Create Obituary
    </Link>
  );
};
