/**
 * Obituary Length Configuration
 *
 * This file contains client-safe configuration for obituary length options.
 * It's separated from prompts.ts to avoid importing server-only code in client components.
 */

export type ObituaryLength = "short" | "medium" | "long";

export const OBITUARY_LENGTH_CONFIG = {
  short: {
    label: "Short",
    description: "150-250 words, ideal for newspaper notices",
    wordMin: 150,
    wordMax: 250,
  },
  medium: {
    label: "Medium",
    description: "250-400 words, standard obituary length",
    wordMin: 250,
    wordMax: 400,
  },
  long: {
    label: "Long",
    description: "400-600 words, detailed life tribute",
    wordMin: 400,
    wordMax: 600,
  },
} as const;

/** Default length for backward compatibility */
export const DEFAULT_OBITUARY_LENGTH: ObituaryLength = "medium";

/**
 * Generate length guideline text for prompt injection
 */
export const getLengthGuideline = (length: ObituaryLength): string => {
  const config = OBITUARY_LENGTH_CONFIG[length];
  return `TARGET LENGTH: Write between ${config.wordMin} and ${config.wordMax} words (approximately ${config.wordMin * 6}-${config.wordMax * 6} characters)`;
};
