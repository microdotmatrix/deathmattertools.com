"use client";

import { Icon } from "@/components/ui/icon";

interface CommentContentProps {
  content: string;
}

/**
 * Parses comment content and renders blockquotes with special styling
 */
export const CommentContent = ({ content }: CommentContentProps) => {
  // Check if content starts with a blockquote (markdown > syntax)
  const lines = content.split('\n');
  const blockquoteLines: string[] = [];
  let remainingContent = '';
  let inBlockquote = true;

  for (const line of lines) {
    if (inBlockquote && line.trim().startsWith('>')) {
      // Remove the > and trim
      blockquoteLines.push(line.trim().substring(1).trim());
    } else if (inBlockquote && line.trim() === '') {
      // Empty line might separate blockquote from reply
      continue;
    } else {
      // End of blockquote, rest is the reply
      inBlockquote = false;
      remainingContent += (remainingContent ? '\n' : '') + line;
    }
  }

  const hasBlockquote = blockquoteLines.length > 0;
  const blockquoteText = blockquoteLines.join('\n');
  const replyText = remainingContent.trim();

  if (!hasBlockquote) {
    // No blockquote, render as plain text
    return <p className="text-sm whitespace-pre-line">{content}</p>;
  }

  return (
    <div className="space-y-3">
      {/* Blockquote with styled preview */}
      <div className="relative p-3 pl-4 rounded-md bg-muted/30 border-l-4 border-muted-foreground/30">
        <div className="flex items-start gap-2 mb-1">
          <Icon icon="mdi:format-quote-close" className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-xs font-medium text-muted-foreground">
            Replying to:
          </span>
        </div>
        <blockquote className="text-sm text-muted-foreground italic whitespace-pre-line pl-5">
          {blockquoteText}
        </blockquote>
      </div>

      {/* Reply content */}
      {replyText && (
        <p className="text-sm whitespace-pre-line">
          {replyText}
        </p>
      )}
    </div>
  );
};
