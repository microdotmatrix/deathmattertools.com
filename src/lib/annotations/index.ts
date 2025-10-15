/**
 * Text annotation utilities for anchoring comments to specific text selections
 * 
 * This module provides tools for:
 * - Extracting anchor data from text selections
 * - Restoring selections from stored anchor data
 * - Assigning colors to users
 * - Calculating indicator positions
 */

export { extractAnchorData, getTextOffset, validateAnchorData, getAnchorSummary } from "./extract-anchor";
export { restoreSelection, highlightRangeTemporarily } from "./restore-selection";
export { getUserColor, getAllColors, hexToRgba } from "./user-colors";
export { calculateIndicatorPositions, insertIndicators, getPrimaryStatus } from "./calculate-positions";
export { navigateToAnchor, isAnchorValid, navigateToFirstComment } from "./navigation";
export { calculateYPosition, calculateIndicatorPositions as calculateIndicatorYPositions } from "./position-calculator";

export type { AnchorData } from "./extract-anchor";
export type { AnnotationIndicator, TextSegment } from "./calculate-positions";
