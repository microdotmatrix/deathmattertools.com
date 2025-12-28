import type { CommentForAI } from "@/lib/db/queries/comments-for-ai";

/**
 * Format a single comment for AI context, including anchor and thread info.
 */
function formatSingleComment(comment: CommentForAI, index: number): string {
  const lines: string[] = [];

  // Header with index and author
  lines.push(`### Comment ${index + 1} from ${comment.authorName}`);

  // Anchor context if present
  if (comment.anchor) {
    lines.push("");
    lines.push(`**Anchored to text:** "${comment.anchor.text}"`);
    lines.push(`*(Position: characters ${comment.anchor.start}-${comment.anchor.end})*`);
  }

  // The comment content
  lines.push("");
  lines.push(`**Suggestion:** ${comment.content}`);

  // Thread replies if any
  if (comment.thread.length > 0) {
    lines.push("");
    lines.push("**Discussion thread:**");
    for (const reply of comment.thread) {
      lines.push(`- ${reply.authorName}: "${reply.content}"`);
    }
  }

  return lines.join("\n");
}

/**
 * Format all approved comments into a markdown context string for the AI.
 * Prioritizes anchored comments and includes full thread context.
 */
export function formatCommentsForAI(comments: CommentForAI[]): string {
  if (comments.length === 0) {
    return "";
  }

  const lines: string[] = [];

  lines.push("## Approved Comments to Apply");
  lines.push("");
  lines.push(`There are **${comments.length}** approved comment${comments.length > 1 ? "s" : ""} waiting to be applied.`);
  lines.push("");

  // Separate anchored and general comments
  const anchoredComments = comments.filter((c) => c.anchor !== null);
  const generalComments = comments.filter((c) => c.anchor === null);

  // Format anchored comments first (they have specific locations)
  if (anchoredComments.length > 0) {
    lines.push("### Comments with Specific Text References");
    lines.push("*These comments reference specific text in the document and should be applied to those locations.*");
    lines.push("");

    for (let i = 0; i < anchoredComments.length; i++) {
      lines.push(formatSingleComment(anchoredComments[i]!, i));
      lines.push("");
    }
  }

  // Format general comments
  if (generalComments.length > 0) {
    const startIndex = anchoredComments.length;
    lines.push("### General Comments");
    lines.push("*These comments provide general suggestions without specific text references.*");
    lines.push("");

    for (let i = 0; i < generalComments.length; i++) {
      lines.push(formatSingleComment(generalComments[i]!, startIndex + i));
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Format a single comment for pre-filled chat message.
 */
export function formatCommentForChatMessage(comment: {
  content: string;
  authorName: string;
  anchorText?: string | null;
  thread?: Array<{ authorName: string; content: string }>;
}): string {
  const lines: string[] = [];

  lines.push(`Please apply this approved comment from ${comment.authorName}:`);
  lines.push("");
  lines.push(`"${comment.content}"`);

  if (comment.anchorText) {
    lines.push("");
    lines.push(`This comment is anchored to the text: "${comment.anchorText}"`);
  }

  if (comment.thread && comment.thread.length > 0) {
    lines.push("");
    lines.push("Discussion context:");
    for (const reply of comment.thread) {
      lines.push(`- ${reply.authorName}: "${reply.content}"`);
    }
  }

  return lines.join("\n");
}

/**
 * Format multiple comments for bulk apply chat message.
 * Includes comment IDs so the AI can mark them as resolved.
 */
export function formatBulkCommentsForChatMessage(comments: Array<{
  id: string;
  content: string;
  authorName: string;
  anchorText?: string | null;
}>): string {
  const lines: string[] = [];

  lines.push(`Please apply all ${comments.length} approved comment${comments.length > 1 ? "s" : ""} to the obituary and mark them as resolved.`);
  lines.push("");
  lines.push("After applying these changes, mark the following comment IDs as resolved:");
  lines.push(`\`[${comments.map((c) => `\"${c.id}\"`).join(", ")}]\``);
  lines.push("");
  lines.push("Here are the approved comments to apply:");
  lines.push("");

  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i]!;
    lines.push(`**${i + 1}. From ${comment.authorName}** (ID: ${comment.id}):`);
    lines.push(`\"${comment.content}\"`);
    if (comment.anchorText) {
      lines.push(`*(Anchored to: \"${comment.anchorText}\")*`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate a summary of comments for preview.
 */
export function generateCommentsSummary(comments: CommentForAI[]): string {
  if (comments.length === 0) {
    return "No approved comments to apply.";
  }

  const anchoredCount = comments.filter((c) => c.anchor !== null).length;
  const generalCount = comments.length - anchoredCount;

  const parts: string[] = [];
  parts.push(`${comments.length} approved comment${comments.length > 1 ? "s" : ""}`);

  if (anchoredCount > 0 && generalCount > 0) {
    parts.push(`(${anchoredCount} with specific text references, ${generalCount} general)`);
  } else if (anchoredCount > 0) {
    parts.push("(all with specific text references)");
  }

  // Add preview of first few comments
  const previewComments = comments.slice(0, 3);
  const previews = previewComments.map((c) => {
    const truncated = c.content.length > 60 ? `${c.content.slice(0, 60)}...` : c.content;
    return `• ${c.authorName}: "${truncated}"`;
  });

  if (comments.length > 3) {
    previews.push(`• ...and ${comments.length - 3} more`);
  }

  return `${parts.join(" ")}\n\n${previews.join("\n")}`;
}
