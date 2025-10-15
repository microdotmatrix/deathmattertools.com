/**
 * Utilities for restoring text selections from anchor data
 * Implements multi-layer matching strategy for robustness
 */

import { AnchorData } from "./extract-anchor";

/**
 * Create a Range from character offsets within a container
 */
function createRangeFromOffsets(
  container: HTMLElement,
  start: number,
  end: number
): Range | null {
  const range = document.createRange();
  let currentOffset = 0;
  
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let startNode: Node | null = null;
  let startOffset = 0;
  let endNode: Node | null = null;
  let endOffset = 0;
  
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const textLength = node.textContent?.length || 0;
    
    // Find start position
    if (!startNode && currentOffset + textLength >= start) {
      startNode = node;
      startOffset = start - currentOffset;
    }
    
    // Find end position
    if (!endNode && currentOffset + textLength >= end) {
      endNode = node;
      endOffset = end - currentOffset;
      break;
    }
    
    currentOffset += textLength;
  }
  
  if (startNode && endNode) {
    try {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      return range;
    } catch (e) {
      console.error("Error creating range:", e);
      return null;
    }
  }
  
  return null;
}

/**
 * Find text using exact quote and context matching
 */
function findByTextQuote(
  container: HTMLElement,
  text: string,
  prefix: string,
  suffix: string
): Range | null {
  const fullText = container.textContent || "";
  
  // Try to find the text with full context
  const contextPattern = prefix + text + suffix;
  let index = fullText.indexOf(contextPattern);
  
  if (index !== -1) {
    const start = index + prefix.length;
    const end = start + text.length;
    return createRangeFromOffsets(container, start, end);
  }
  
  // Try with just the text (no context)
  index = fullText.indexOf(text);
  if (index !== -1) {
    const start = index;
    const end = start + text.length;
    return createRangeFromOffsets(container, start, end);
  }
  
  return null;
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Try fuzzy matching when exact match fails
 */
function findByFuzzyMatch(
  container: HTMLElement,
  anchor: AnchorData
): Range | null {
  const fullText = container.textContent || "";
  const searchText = anchor.text;
  const maxDistance = Math.floor(searchText.length * 0.2); // 20% tolerance
  
  // Slide a window across the text looking for close matches
  for (let i = 0; i <= fullText.length - searchText.length; i++) {
    const candidate = fullText.substring(i, i + searchText.length);
    const distance = levenshteinDistance(searchText, candidate);
    
    if (distance <= maxDistance) {
      return createRangeFromOffsets(container, i, i + searchText.length);
    }
  }
  
  return null;
}

/**
 * Restore a text selection from anchor data
 * Uses multi-layer strategy for robustness:
 * 1. Try exact position match
 * 2. Try text quote with context
 * 3. Try fuzzy matching
 * 4. Give up and return null
 * 
 * @param anchor - The anchor data to restore
 * @param container - The container element
 * @returns Range if successful, null if text has changed too much
 */
export function restoreSelection(
  anchor: AnchorData,
  container: HTMLElement
): Range | null {
  // Strategy 1: Try exact position match (fastest)
  const exactMatch = createRangeFromOffsets(container, anchor.start, anchor.end);
  if (exactMatch && exactMatch.toString() === anchor.text) {
    return exactMatch;
  }
  
  // Strategy 2: Try text quote matching (most robust)
  const quoteMatch = findByTextQuote(
    container,
    anchor.text,
    anchor.prefix,
    anchor.suffix
  );
  if (quoteMatch) {
    return quoteMatch;
  }
  
  // Strategy 3: Try fuzzy matching (handles minor edits)
  const fuzzyMatch = findByFuzzyMatch(container, anchor);
  if (fuzzyMatch) {
    return fuzzyMatch;
  }
  
  // Strategy 4: Give up - text was significantly changed
  return null;
}

/**
 * Highlight a range temporarily (for navigation feedback)
 */
export function highlightRangeTemporarily(
  range: Range,
  duration = 2000,
  color = "rgba(255, 237, 74, 0.4)" // Yellow highlight
): void {
  // Create highlight span
  const highlight = document.createElement("span");
  highlight.style.backgroundColor = color;
  highlight.style.transition = "background-color 0.3s ease-out";
  
  try {
    // Wrap range in highlight
    range.surroundContents(highlight);
    
    // Fade out and remove
    setTimeout(() => {
      highlight.style.backgroundColor = "transparent";
      setTimeout(() => {
        const parent = highlight.parentNode;
        if (parent) {
          while (highlight.firstChild) {
            parent.insertBefore(highlight.firstChild, highlight);
          }
          parent.removeChild(highlight);
        }
      }, 300);
    }, duration);
  } catch (e) {
    console.error("Error highlighting range:", e);
  }
}
