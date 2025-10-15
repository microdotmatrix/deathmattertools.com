"use client";

import { useRef, useCallback } from "react";
import { Response } from "@/components/ai/response";
import { useTextSelection } from "@/hooks/use-text-selection";
import { SelectionToolbar } from "@/components/annotations";
import type { AnchorData } from "@/lib/annotations";

interface ObituaryViewerSimpleProps {
  id?: string;
  content?: string;
  canComment?: boolean;
  onCreateQuotedComment?: (anchor: AnchorData) => void;
}

export const ObituaryViewerSimple = ({
  id,
  content = "",
  canComment = false,
  onCreateQuotedComment,
}: ObituaryViewerSimpleProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { range, text } = useTextSelection(
    contentRef as unknown as React.RefObject<HTMLElement>,
    canComment
  );

  const handleCreateComment = useCallback(() => {
    if (range && contentRef.current && onCreateQuotedComment) {
      const { extractAnchorData } = require("@/lib/annotations");
      const anchor = extractAnchorData(range, contentRef.current);
      onCreateQuotedComment(anchor);

      // Clear selection after extracting
      window.getSelection()?.removeAllRanges();
    }
  }, [range, onCreateQuotedComment]);

  return (
    <div className="relative">
      {/* Content - clean markdown with no indicators */}
      <div
        ref={contentRef}
        className="loading-fade prose dark:prose-invert prose-md lg:prose-lg max-w-4xl"
      >
        <Response key={id}>{content}</Response>
      </div>

      {/* Selection toolbar */}
      {canComment && (
        <SelectionToolbar
          range={range}
          onCreateComment={handleCreateComment}
          enabled={!!text}
        />
      )}
    </div>
  );
};
