"use client";

import { useRef, useState, useCallback } from "react";
import { Response } from "@/components/ai/response";
import { useTextSelection } from "@/hooks/use-text-selection";
import { extractAnchorData, getUserColor } from "@/lib/annotations";
import { calculateIndicatorPositions } from "@/lib/annotations/calculate-positions";
import {
  AnnotatableText,
  SelectionToolbar,
} from "@/components/annotations";
import type { DocumentComment } from "@/lib/db/schema";
import type { AnchorData } from "@/lib/annotations";

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
        <Response key={id}>{content}</Response>
        
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
