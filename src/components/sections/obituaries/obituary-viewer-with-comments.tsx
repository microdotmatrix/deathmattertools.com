"use client";

import { createCommentAction } from "@/actions/comments";
import { QuotedCommentForm } from "@/components/annotations/quoted-comment-form";
import type { AnchorData } from "@/lib/annotations";
import { useState } from "react";
import { ObituaryViewerSimple } from "./obituary-viewer-simple";
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
