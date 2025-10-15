/**
 * Calculate Y positions for margin indicators based on character offsets
 */

/**
 * Find the DOM text node and offset within that node for a character position
 */
function findTextNodeAtOffset(
  root: Node,
  targetOffset: number
): { node: Text; offset: number } | null {
  let currentOffset = 0;
  
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let textNode: Text | null = null;
  
  while ((textNode = walker.nextNode() as Text | null)) {
    const textLength = textNode.textContent?.length || 0;
    
    if (currentOffset + textLength >= targetOffset) {
      return {
        node: textNode,
        offset: targetOffset - currentOffset,
      };
    }
    
    currentOffset += textLength;
  }
  
  return null;
}

/**
 * Calculate the Y position (top offset) for a character position within a container
 * @param container - The container element (e.g., the obituary content div)
 * @param characterOffset - The character offset to find
 * @returns Y position relative to container top, or null if not found
 */
export function calculateYPosition(
  container: HTMLElement,
  characterOffset: number
): number | null {
  const result = findTextNodeAtOffset(container, characterOffset);
  
  if (!result) {
    return null;
  }
  
  try {
    // Create a range at the specific position
    const range = document.createRange();
    range.setStart(result.node, result.offset);
    range.setEnd(result.node, result.offset);
    
    // Get the bounding rectangle
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate position relative to container
    const yPosition = rect.top - containerRect.top;
    
    return yPosition;
  } catch (error) {
    console.error("Error calculating Y position:", error);
    return null;
  }
}

/**
 * Calculate positions for multiple indicators
 */
export interface IndicatorPosition {
  commentIds: string[];
  userColors: string[];
  statuses: ("pending" | "approved" | "denied")[];
  yPosition: number;
}

export function calculateIndicatorPositions(
  container: HTMLElement,
  anchors: Array<{
    position: number;
    commentIds: string[];
    userColors: string[];
    statuses: ("pending" | "approved" | "denied")[];
  }>
): IndicatorPosition[] {
  const positions: IndicatorPosition[] = [];
  
  for (const anchor of anchors) {
    const yPosition = calculateYPosition(container, anchor.position);
    
    if (yPosition !== null) {
      positions.push({
        commentIds: anchor.commentIds,
        userColors: anchor.userColors,
        statuses: anchor.statuses,
        yPosition,
      });
    }
  }
  
  return positions;
}
