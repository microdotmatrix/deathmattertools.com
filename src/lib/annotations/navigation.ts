/**
 * Navigation utilities for jumping to anchored comments
 */

import { restoreSelection, highlightRangeTemporarily } from "./restore-selection";
import type { AnchorData } from "./extract-anchor";

/**
 * Scroll to and highlight an anchor in the document
 * @param anchor - The anchor data to navigate to
 * @param container - The container element
 * @param options - Navigation options
 */
export function navigateToAnchor(
  anchor: AnchorData,
  container: HTMLElement,
  options: {
    highlightDuration?: number;
    highlightColor?: string;
    scrollBehavior?: ScrollBehavior;
    scrollOffset?: number;
  } = {}
): boolean {
  const {
    highlightDuration = 2000,
    highlightColor = "rgba(255, 237, 74, 0.4)",
    scrollBehavior = "smooth",
    scrollOffset = 100,
  } = options;

  // Try to restore the selection
  const range = restoreSelection(anchor, container);
  
  if (!range) {
    console.warn("Could not restore anchor - text may have changed");
    return false;
  }

  // Get the bounding rect of the range
  const rect = range.getBoundingClientRect();
  
  // Calculate scroll position (top of range minus offset)
  const scrollTop = window.scrollY + rect.top - scrollOffset;
  
  // Scroll to position
  window.scrollTo({
    top: scrollTop,
    behavior: scrollBehavior,
  });

  // Highlight the text temporarily
  setTimeout(() => {
    highlightRangeTemporarily(range, highlightDuration, highlightColor);
  }, 300); // Small delay to ensure scroll has started

  return true;
}

/**
 * Check if an anchor is still valid in the document
 * @param anchor - The anchor to check
 * @param container - The container element
 * @returns True if anchor can be restored
 */
export function isAnchorValid(
  anchor: AnchorData,
  container: HTMLElement
): boolean {
  const range = restoreSelection(anchor, container);
  return range !== null;
}

/**
 * Navigate to the first comment in a list of comment IDs
 * Useful when clicking an indicator with multiple comments
 */
export function navigateToFirstComment(
  commentIds: string[],
  scrollBehavior: ScrollBehavior = "smooth"
): void {
  if (commentIds.length === 0) return;
  
  const firstCommentId = commentIds[0];
  const element = document.getElementById(`comment-${firstCommentId}`);
  
  if (element) {
    element.scrollIntoView({
      behavior: scrollBehavior,
      block: "center",
    });
    
    // Add a subtle highlight to the comment
    element.classList.add("ring-2", "ring-primary", "ring-offset-2");
    setTimeout(() => {
      element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
    }, 2000);
  }
}
