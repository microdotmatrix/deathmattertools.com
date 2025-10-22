"use client";

import { useRef, useCallback } from "react";
import { Response } from "@/components/ai/response";
import { Icon } from "@/components/ui/icon";
import { useTextSelection } from "@/hooks/use-text-selection";
import { SelectionToolbar } from "@/components/annotations";
import { obituaryUpdateProcessingAtom } from "@/atoms/obituary-update";
import { useAtomValue } from "jotai";
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
  
  // Read processing state from Jotai atom
  const isProcessing = useAtomValue(obituaryUpdateProcessingAtom);

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

      {/* Processing overlay - shown when AI is updating the obituary */}
      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-3">
            <Icon 
              icon="mdi:loading" 
              className="size-12 text-primary animate-spin" 
            />
            <p className="text-sm font-medium text-muted-foreground">
              AI is updating your obituary...
            </p>
          </div>
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
