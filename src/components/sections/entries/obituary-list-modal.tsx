"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Document } from "@/lib/db/schema";
import { useState } from "react";
import { ObituaryList } from "./obituary-list";

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
        
        <ObituaryList obituaries={obituaries} entryId={entryId} canEdit={canEdit} />
      </DialogContent>
    </Dialog>
  );
};
