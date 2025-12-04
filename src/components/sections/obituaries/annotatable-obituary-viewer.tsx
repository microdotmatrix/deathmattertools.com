"use client";

import { MessageResponse } from "@/components/ai-elements/message";
import {
  AnnotatableText,
  SelectionToolbar,
} from "@/components/annotations";
import { useTextSelection } from "@/hooks/use-text-selection";
import type { AnchorData } from "@/lib/annotations";
import { extractAnchorData, getUserColor } from "@/lib/annotations";
import { calculateIndicatorPositions } from "@/lib/annotations/calculate-positions";
import type { DocumentComment } from "@/lib/db/schema";
import { useCallback, useRef } from "react";

interface AnnotatableObituaryViewerProps {
  id?: string;
  content?: string;
  comments?: DocumentComment[];
  canComment?: boolean;
  onCreateAnchoredComment?: (anchor: AnchorData) => void;
  onIndicatorClick?: (commentIds: string[]) => void;
  enableAnnotations?: boolean;
}

export const AnnotatableObituaryViewer = ({
  id,
  content = "",
  comments = [],
  canComment = false,
  onCreateAnchoredComment,
  onIndicatorClick,
  enableAnnotations = true,
}: AnnotatableObituaryViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { range, text } = useTextSelection(
    containerRef as React.RefObject<HTMLElement>, 
    enableAnnotations && canComment
  );
  
  const handleCreateComment = useCallback(() => {
    if (range && containerRef.current && onCreateAnchoredComment) {
      const anchor = extractAnchorData(range, containerRef.current);
      onCreateAnchoredComment(anchor);
      
      // Clear selection after extracting
      window.getSelection()?.removeAllRanges();
    }
  }, [range, onCreateAnchoredComment]);

  const handleIndicatorClick = useCallback((commentIds: string[]) => {
    if (onIndicatorClick) {
      onIndicatorClick(commentIds);
    }
  }, [onIndicatorClick]);

  // Calculate indicators from comments with anchors
  const indicators = enableAnnotations 
    ? calculateIndicatorPositions(comments, getUserColor)
    : [];

  // If no annotations enabled or no indicators, use simple viewer
  if (!enableAnnotations || indicators.length === 0) {
    return (
      <div 
        ref={containerRef}
        className="loading-fade prose dark:prose-invert prose-md lg:prose-lg max-w-4xl lg:mx-12"
      >
        <MessageResponse key={id}>{content}</MessageResponse>
        
        {canComment && enableAnnotations && (
          <SelectionToolbar
            range={range}
            onCreateComment={handleCreateComment}
            enabled={!!text}
          />
        )}
      </div>
    );
  }

  // Render with indicators
  return (
    <div 
      ref={containerRef}
      className="loading-fade prose dark:prose-invert prose-md lg:prose-lg max-w-4xl lg:mx-12"
    >
      <AnnotatableText
        content={content}
        indicators={indicators}
        onIndicatorClick={handleIndicatorClick}
        className="whitespace-pre-wrap"
      />
      
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
