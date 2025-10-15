/**
 * Utilities for extracting and managing text anchors for annotations
 */

export interface AnchorData {
  start: number;
  end: number;
  text: string;
  prefix: string;
  suffix: string;
}

/**
 * Get the character offset of a position within a container
 * Uses TreeWalker to traverse text nodes
 */
export function getTextOffset(
  root: Node,
  targetNode: Node,
  targetOffset: number
): number {
  let currentOffset = 0;
  
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node === targetNode) {
      return currentOffset + targetOffset;
    }
    currentOffset += node.textContent?.length || 0;
  }
  
  return currentOffset;
}

/**
 * Extract anchor data from a Range within a container element
 * @param range - The selected Range
 * @param containerElement - The container element (e.g., obituary content div)
 * @returns Anchor data with position, text, and context
 */
export function extractAnchorData(
  range: Range,
  containerElement: HTMLElement
): AnchorData {
  // Get the full container text
  const fullText = containerElement.textContent || "";
  
  // Get selected text
  const selectedText = range.toString();
  
  // Calculate character offsets within container
  const start = getTextOffset(
    containerElement,
    range.startContainer,
    range.startOffset
  );
  const end = start + selectedText.length;
  
  // Extract context (50 characters before and after)
  const contextLength = 50;
  const prefixStart = Math.max(0, start - contextLength);
  const suffixEnd = Math.min(fullText.length, end + contextLength);
  
  const prefix = fullText.substring(prefixStart, start);
  const suffix = fullText.substring(end, suffixEnd);
  
  return {
    start,
    end,
    text: selectedText,
    prefix,
    suffix,
  };
}

/**
 * Validate that anchor data is complete and valid
 */
export function validateAnchorData(anchor: Partial<AnchorData>): anchor is AnchorData {
  return (
    typeof anchor.start === "number" &&
    typeof anchor.end === "number" &&
    typeof anchor.text === "string" &&
    typeof anchor.prefix === "string" &&
    typeof anchor.suffix === "string" &&
    anchor.start >= 0 &&
    anchor.end > anchor.start &&
    anchor.text.length > 0
  );
}

/**
 * Create a human-readable summary of anchor data for display
 */
export function getAnchorSummary(anchor: AnchorData, maxLength = 50): string {
  const text = anchor.text;
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}
