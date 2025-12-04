"use client";

import { MessageResponse } from "@/components/ai-elements/message";
import { SelectionToolbar } from "@/components/annotations";
import { Icon } from "@/components/ui/icon";
import { useTextSelection } from "@/hooks/use-text-selection";
import { extractAnchorData, type AnchorData } from "@/lib/annotations";
import { obituaryUpdateProcessingAtom } from "@/lib/state";
import { useAtomValue } from "jotai";
import { useRef } from "react";

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
  
  // Read processing state from Jotai atom
  const isProcessing = useAtomValue(obituaryUpdateProcessingAtom);

  // React Compiler handles function stability - no useCallback needed
  const handleCreateComment = () => {
    if (range && contentRef.current && onCreateQuotedComment) {
      const anchor = extractAnchorData(range, contentRef.current);
      onCreateQuotedComment(anchor);

      // Clear selection after extracting
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <div className="relative">
      {/* Content - clean markdown with no indicators */}
      <div
        ref={contentRef}
        className="loading-fade prose dark:prose-invert prose-md lg:prose-lg max-w-4xl"
      >
        <MessageResponse key={id} isAnimating={isProcessing}>{content}</MessageResponse>
      </div>

      {/* Processing indicator - shown when AI is updating the obituary */}
      {isProcessing && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-3 py-2 rounded-full border border-primary/20 z-10 animate-in fade-in duration-200">
          <Icon 
            icon="mdi:loading" 
            className="size-5 text-primary animate-spin" 
          />
          <p className="text-xs font-medium text-primary">
            Updating...
          </p>
        </div>
      )}

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
