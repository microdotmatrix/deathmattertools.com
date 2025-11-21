/**
 * Similar issue detection utilities
 * Uses simple text similarity algorithms to find related bug reports
 */

import type { Feedback } from "@/lib/types/feedback";

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
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

  return matrix[len1][len2];
};

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
const stringSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Normalize text for comparison
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

/**
 * Extract keywords from text
 */
const extractKeywords = (text: string): Set<string> => {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "is",
    "was",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "could",
    "may",
    "might",
    "can",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "them",
    "their",
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
    "this",
    "that",
    "these",
    "those",
  ]);

  const words = normalizeText(text).split(/\s+/);
  const keywords = new Set<string>();

  for (const word of words) {
    if (word.length > 3 && !stopWords.has(word)) {
      keywords.add(word);
    }
  }

  return keywords;
};

/**
 * Calculate keyword overlap between two texts
 */
const keywordOverlap = (text1: string, text2: string): number => {
  const keywords1 = extractKeywords(text1);
  const keywords2 = extractKeywords(text2);

  if (keywords1.size === 0 || keywords2.size === 0) {
    return 0;
  }

  let overlap = 0;
  for (const keyword of keywords1) {
    if (keywords2.has(keyword)) {
      overlap++;
    }
  }

  return (2 * overlap) / (keywords1.size + keywords2.size);
};

export interface SimilarIssue {
  feedback: Feedback;
  similarity: number;
  matchReasons: string[];
}

/**
 * Find similar issues based on subject, message, and module
 */
export const findSimilarIssues = (
  currentIssue: {
    subject: string;
    message: string;
    metadata?: Record<string, unknown>;
  },
  allFeedback: Feedback[],
  options: {
    minSimilarity?: number;
    maxResults?: number;
    onlyBugs?: boolean;
  } = {}
): SimilarIssue[] => {
  const {
    minSimilarity = 0.5,
    maxResults = 5,
    onlyBugs = true,
  } = options;

  const currentModule = currentIssue.metadata?.module as string | undefined;
  const currentSubject = normalizeText(currentIssue.subject);
  const currentMessage = normalizeText(currentIssue.message);

  const similarities: SimilarIssue[] = [];

  for (const feedback of allFeedback) {
    // Skip if only bugs and this isn't a bug
    if (onlyBugs && feedback.type !== "bug") {
      continue;
    }

    const feedbackModule = feedback.metadata?.module as string | undefined;
    const feedbackSubject = normalizeText(feedback.subject);
    const feedbackMessage = normalizeText(feedback.message);

    const matchReasons: string[] = [];
    let totalSimilarity = 0;
    let weights = 0;

    // Subject similarity (weight: 0.4)
    const subjectSim = stringSimilarity(currentSubject, feedbackSubject);
    if (subjectSim > 0.3) {
      totalSimilarity += subjectSim * 0.4;
      weights += 0.4;
      if (subjectSim > 0.7) {
        matchReasons.push("Similar subject line");
      }
    }

    // Message keyword overlap (weight: 0.4)
    const messageOverlap = keywordOverlap(currentMessage, feedbackMessage);
    if (messageOverlap > 0.2) {
      totalSimilarity += messageOverlap * 0.4;
      weights += 0.4;
      if (messageOverlap > 0.5) {
        matchReasons.push("Similar error description");
      }
    }

    // Same module (weight: 0.2)
    if (currentModule && feedbackModule && currentModule === feedbackModule) {
      totalSimilarity += 1.0 * 0.2;
      weights += 0.2;
      matchReasons.push(`Same module: ${currentModule}`);
    }

    // Calculate final similarity
    const finalSimilarity = weights > 0 ? totalSimilarity / weights : 0;

    if (finalSimilarity >= minSimilarity && matchReasons.length > 0) {
      similarities.push({
        feedback,
        similarity: finalSimilarity,
        matchReasons,
      });
    }
  }

  // Sort by similarity (descending) and limit results
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults);
};

/**
 * Format similarity score as percentage
 */
export const formatSimilarity = (score: number): string => {
  return `${Math.round(score * 100)}%`;
};
