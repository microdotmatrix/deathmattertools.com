"use client";

import { createCommentAction } from "@/actions/comments";
import { QuotedCommentForm } from "@/components/annotations/quoted-comment-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import type { AnchorData } from "@/lib/annotations";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type RefObject, useRef, useState } from "react";

// Dynamic imports with SSR disabled for client-only rendering
const ObituaryViewerSimple = dynamic(
  () => import("./obituary-viewer-simple").then((mod) => mod.ObituaryViewerSimple),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading obituary...</p>
        </div>
      </div>
    ),
  }
);

const ObituaryEditorInline = dynamic(
  () => import("./obituary-editor-inline").then((mod) => mod.ObituaryEditorInline),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

interface ObituaryViewerWithCommentsProps {
  documentId: string;
  entryId: string;
  content: string;
  canComment: boolean;
  canEdit?: boolean;
  /** External ref for content element (used by ExportActionsBar) */
  contentRef?: RefObject<HTMLDivElement | null>;
  /** Callback when editing state changes */
  onEditingChange?: (isEditing: boolean) => void;
}

export const ObituaryViewerWithComments = ({
  documentId,
  entryId,
  content,
  canComment,
  canEdit = false,
  contentRef: externalContentRef,
  onEditingChange,
}: ObituaryViewerWithCommentsProps) => {
  const router = useRouter();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<AnchorData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const internalContentRef = useRef<HTMLDivElement>(null);
  const contentRef = externalContentRef ?? internalContentRef;

  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
    onEditingChange?.(editing);
  };

  // React Compiler handles function stability - no useCallback needed
  const handleCreateQuotedComment = (anchor: AnchorData) => {
    setCurrentQuote(anchor);
    setShowCommentForm(true);
  };

  const handleCommentSuccess = () => {
    setShowCommentForm(false);
    setCurrentQuote(null);
    router.refresh();
  };

  const handleCommentCancel = () => {
    setShowCommentForm(false);
    setCurrentQuote(null);
  };

  // Bind createCommentAction to this document
  const boundCreateComment = async (formData: FormData) => {
    return createCommentAction(documentId, {}, formData);
  };

  return (
    <>
      {/* Load editor only when editing */}
      {canEdit && isEditing ? (
        <ObituaryEditorInline
          documentId={documentId}
          entryId={entryId}
          initialContent={content}
          canEdit={canEdit}
          onClose={() => handleEditingChange(false)}
        />
      ) : (
        <div ref={contentRef} className="print-content">
          <ObituaryViewerSimple
            id={documentId}
            content={content}
            canComment={canComment}
            onCreateQuotedComment={handleCreateQuotedComment}
          />
        </div>
      )}

      {/* Show Edit button for owners; load editor only when clicked */}
      {canEdit && !isEditing && (
        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => handleEditingChange(true)}
            variant="outline"
            size="lg"
          >
            <Icon icon="mdi:pencil" className="mr-2 h-4 w-4" />
            Open Editor
          </Button>
        </div>
      )}

      {/* Comment Form Dialog */}
      <Dialog open={showCommentForm} onOpenChange={setShowCommentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentQuote ? "Reply to Selection" : "Add Comment"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {currentQuote 
                ? "Add a comment referencing the selected text from the obituary"
                : "Add a general comment to this obituary"}
            </DialogDescription>
          </DialogHeader>
          
          <QuotedCommentForm
            documentId={documentId}
            quote={currentQuote}
            action={boundCreateComment}
            onSuccess={handleCommentSuccess}
            onCancel={handleCommentCancel}
            placeholder="Share your thoughts or feedback..."
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
