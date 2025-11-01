"use client";

import { createCommentAction } from "@/actions/comments";
import { QuotedCommentForm } from "@/components/annotations/quoted-comment-form";
import type { AnchorData } from "@/lib/annotations";
import { useState } from "react";
import { ObituaryViewerSimple } from "./obituary-viewer-simple";
import { ObituaryEditorInline } from "./obituary-editor-inline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
