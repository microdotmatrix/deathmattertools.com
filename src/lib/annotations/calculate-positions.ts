/**
 * Calculate indicator positions for anchored comments
 */

import type { DocumentComment, AnchorStatus } from "@/lib/db/schema";

export interface AnnotationIndicator {
  position: number;
  commentIds: string[];
  userColors: string[];
  statuses: AnchorStatus[];
}

/**
 * Calculate indicator positions from comments with anchors
 * Groups multiple comments at the same position
 * 
 * @param comments - Array of comments with potential anchors
 * @param getUserColor - Function to get color for a user ID
 * @returns Array of indicator data sorted by position
 */
export function calculateIndicatorPositions(
  comments: DocumentComment[],
  getUserColor: (userId: string) => string
): AnnotationIndicator[] {
  const indicators = new Map<number, AnnotationIndicator>();
  
  comments.forEach((comment) => {
    // Skip comments without anchors or invalid anchors
    if (
      comment.anchorStart == null ||
      comment.anchorEnd == null ||
      !comment.anchorValid
    ) {
      return;
    }
    
    const position = comment.anchorStart;
    const userColor = getUserColor(comment.userId);
    const status = (comment.anchorStatus || "pending") as AnchorStatus;
    
    if (indicators.has(position)) {
      // Multiple comments at same position
      const existing = indicators.get(position)!;
      existing.commentIds.push(comment.id);
      existing.userColors.push(userColor);
      existing.statuses.push(status);
    } else {
      // First comment at this position
      indicators.set(position, {
        position,
        commentIds: [comment.id],
        userColors: [userColor],
        statuses: [status],
      });
    }
  });
  
  // Sort by position for rendering
  return Array.from(indicators.values()).sort((a, b) => a.position - b.position);
}

/**
 * Split text content into segments with indicators inserted at positions
 */
export interface TextSegment {
  type: "text" | "indicator";
  content?: string;
  indicator?: AnnotationIndicator;
}

export function insertIndicators(
  text: string,
  indicators: AnnotationIndicator[]
): TextSegment[] {
  if (indicators.length === 0) {
    return [{ type: "text", content: text }];
  }
  
  const segments: TextSegment[] = [];
  let lastPosition = 0;
  
  indicators.forEach((indicator) => {
    const position = indicator.position;
    
    // Add text before indicator
    if (position > lastPosition) {
      segments.push({
        type: "text",
        content: text.substring(lastPosition, position),
      });
    }
    
    // Add indicator
    segments.push({
      type: "indicator",
      indicator,
    });
    
    lastPosition = position;
  });
  
  // Add remaining text after last indicator
  if (lastPosition < text.length) {
    segments.push({
      type: "text",
      content: text.substring(lastPosition),
    });
  }
  
  return segments;
}

/**
 * Get the primary status from multiple statuses
 * Priority: approved > pending > denied
 */
export function getPrimaryStatus(statuses: AnchorStatus[]): AnchorStatus {
  if (statuses.includes("approved")) return "approved";
  if (statuses.includes("pending")) return "pending";
  return "denied";
}
