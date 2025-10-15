"use client";

import { useState, useCallback } from "react";
import { ObituaryViewerSimple } from "./obituary-viewer-simple";
import { QuotedCommentForm } from "@/components/annotations/quoted-comment-form";
import { createCommentAction } from "@/actions/comments";
import type { AnchorData } from "@/lib/annotations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ObituaryViewerWithCommentsProps {
  documentId: string;
  content: string;
  canComment: boolean;
}

export const ObituaryViewerWithComments = ({
  documentId,
  content,
  canComment,
}: ObituaryViewerWithCommentsProps) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<AnchorData | null>(null);

  const handleCreateQuotedComment = useCallback((anchor: AnchorData) => {
    setCurrentQuote(anchor);
    setShowCommentForm(true);
  }, []);

  const handleCommentSuccess = useCallback(() => {
    setShowCommentForm(false);
    setCurrentQuote(null);
    // Page will auto-refresh via revalidation
  }, []);

  const handleCommentCancel = useCallback(() => {
    setShowCommentForm(false);
    setCurrentQuote(null);
  }, []);

  // Bind createCommentAction to this document
  const boundCreateComment = useCallback(
    async (formData: FormData) => {
      return createCommentAction(documentId, {}, formData);
    },
    [documentId]
  );

  return (
    <>
      <ObituaryViewerSimple
        id={documentId}
        content={content}
        canComment={canComment}
        onCreateQuotedComment={handleCreateQuotedComment}
      />

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
