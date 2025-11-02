"use client";

import { createCommentAction } from "@/actions/comments";
import { QuotedCommentForm } from "@/components/annotations/quoted-comment-form";
import type { AnchorData } from "@/lib/annotations";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
}

export const ObituaryViewerWithComments = ({
  documentId,
  entryId,
  content,
  canComment,
  canEdit = false,
}: ObituaryViewerWithCommentsProps) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<AnchorData | null>(null);

  // React Compiler handles function stability - no useCallback needed
  const handleCreateQuotedComment = (anchor: AnchorData) => {
    setCurrentQuote(anchor);
    setShowCommentForm(true);
  };

  const handleCommentSuccess = () => {
    setShowCommentForm(false);
    setCurrentQuote(null);
    // Page will auto-refresh via revalidation
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
      {/* Use inline editor for owners, simple viewer for others */}
      {canEdit ? (
        <ObituaryEditorInline
          documentId={documentId}
          entryId={entryId}
          initialContent={content}
          canEdit={canEdit}
          canComment={canComment}
          onCreateQuotedComment={handleCreateQuotedComment}
        />
      ) : (
        <ObituaryViewerSimple
          id={documentId}
          content={content}
          canComment={canComment}
          onCreateQuotedComment={handleCreateQuotedComment}
        />
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
