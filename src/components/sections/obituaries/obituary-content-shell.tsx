"use client";

import { useRef, useState } from "react";
import { ExportActionsBar } from "./export-actions-bar";
import { ObituaryViewerWithComments } from "./obituary-viewer-with-comments";

interface ObituaryContentShellProps {
  documentId: string;
  entryId: string;
  content: string;
  canComment: boolean;
  canEdit: boolean;
  entryName: string;
  createdAt: Date;
  createdAtLabel: string;
}

export const ObituaryContentShell = ({
  documentId,
  entryId,
  content,
  canComment,
  canEdit,
  entryName,
  createdAt,
  createdAtLabel,
}: ObituaryContentShellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-6">
      {/* Header row: Title with honoring/created info */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="text-xl font-semibold">
          {canEdit ? "Edit & Review" : "Memorial Overview"}
        </h2>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">Honoring:</span>{" "}
            {entryName}
          </span>
          <span>
            <span className="font-medium text-foreground">Created:</span>{" "}
            {createdAtLabel}
          </span>
        </div>
      </div>

      {/* Export actions row */}
      {!isEditing && (
        <div className="flex items-center justify-end">
          <ExportActionsBar
            content={content}
            entryName={entryName}
            createdAt={createdAt}
            disabled={isEditing}
          />
        </div>
      )}

      {/* Obituary content viewer */}
      <ObituaryViewerWithComments
        key={`${documentId}-${content.length}`}
        documentId={documentId}
        entryId={entryId}
        content={content}
        canComment={canComment}
        canEdit={canEdit}
        contentRef={contentRef}
        onEditingChange={setIsEditing}
      />
    </div>
  );
};
