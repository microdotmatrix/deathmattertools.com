/**
 * Utilities for assigning consistent colors to users for annotations
 */

const ANNOTATION_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
] as const;

/**
 * Simple hash function for strings
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a consistent color for a user based on their ID
 * @param userId - The user's ID
 * @returns A hex color string
 */
export function getUserColor(userId: string): string {
  const hash = hashCode(userId);
  return ANNOTATION_COLORS[hash % ANNOTATION_COLORS.length];
}

/**
 * Get all available annotation colors
 */
export function getAllColors(): readonly string[] {
  return ANNOTATION_COLORS;
}

/**
 * Convert hex color to rgba with alpha
 */
export function hexToRgba(hex: string, alpha = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
