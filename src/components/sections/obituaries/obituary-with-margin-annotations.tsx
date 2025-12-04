"use client";

import { MessageResponse } from "@/components/ai-elements/message";
import { SelectionToolbar } from "@/components/annotations";
import { MarginIndicators } from "@/components/annotations/margin-indicators";
import { useTextSelection } from "@/hooks/use-text-selection";
import type { AnchorData } from "@/lib/annotations";
import { calculateIndicatorPositions, getUserColor } from "@/lib/annotations";
import type { DocumentComment } from "@/lib/db/schema";
import { useCallback, useRef } from "react";

interface ObituaryWithMarginAnnotationsProps {
  id?: string;
  content?: string;
  comments?: DocumentComment[];
  canComment?: boolean;
  onCreateAnchoredComment?: (anchor: AnchorData) => void;
  onIndicatorClick?: (commentIds: string[]) => void;
  enableAnnotations?: boolean;
}

export const ObituaryWithMarginAnnotations = ({
  id,
  content = "",
  comments = [],
  canComment = false,
  onCreateAnchoredComment,
  onIndicatorClick,
  enableAnnotations = true,
}: ObituaryWithMarginAnnotationsProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { range, text } = useTextSelection(
    contentRef as unknown as React.RefObject<HTMLElement>,
    enableAnnotations && canComment
  );

  const handleCreateComment = useCallback(() => {
    if (range && contentRef.current && onCreateAnchoredComment) {
      // Need to import extractAnchorData
      const { extractAnchorData } = require("@/lib/annotations");
      const anchor = extractAnchorData(range, contentRef.current);
      onCreateAnchoredComment(anchor);

      // Clear selection after extracting
      window.getSelection()?.removeAllRanges();
    }
  }, [range, onCreateAnchoredComment]);

  const handleIndicatorClick = useCallback(
    (commentIds: string[]) => {
      if (onIndicatorClick) {
        onIndicatorClick(commentIds);
      }
    },
    [onIndicatorClick]
  );

  // Calculate indicators from comments with anchors
  const indicators = enableAnnotations
    ? calculateIndicatorPositions(comments, getUserColor)
    : [];

  return (
    <div className="relative">
      {/* Left margin for indicators - reserve space */}
      <div className="flex gap-4">
        {/* Margin spacer */}
        <div className="w-8 flex-shrink-0 relative">
          {/* Indicators positioned absolutely within this margin */}
          {indicators.length > 0 && (
            <MarginIndicators
              indicators={indicators}
              contentRef={contentRef as unknown as React.RefObject<HTMLElement>}
              onIndicatorClick={handleIndicatorClick}
            />
          )}
        </div>

        {/* Content - original markdown, unchanged */}
        <div
          ref={contentRef}
          className="flex-1 loading-fade prose dark:prose-invert prose-md lg:prose-lg"
        >
          <MessageResponse key={id}>{content}</MessageResponse>
        </div>
      </div>

      {/* Selection toolbar */}
      {canComment && enableAnnotations && (
        <SelectionToolbar
          range={range}
          onCreateComment={handleCreateComment}
          enabled={!!text}
        />
      )}
    </div>
  );
};
