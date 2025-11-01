/**
 * Simple Markdown to HTML converter for TipTap editor
 * Converts common Markdown syntax to HTML that TipTap can parse
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Blockquotes
  html = html.replace(/^\> (.+$)/gim, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');
  html = html.replace(/^\*\*\*$/gim, '<hr>');

  // Unordered lists
  html = html.replace(/^\* (.+$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.+$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+$)/gim, '<li>$1</li>');

  // Paragraphs (lines that aren't wrapped in tags)
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gim, '<p>$1</p>');

  // Clean up multiple consecutive paragraph tags
  html = html.replace(/<\/p>\n<p>/g, '</p><p>');

  return html;
}

/**
 * Simple HTML to Markdown converter for saving from TipTap
 * Converts HTML elements back to Markdown syntax
 */
export function htmlToMarkdown(html: string): string {
  let markdown = html;

  // Headers
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n');
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n');
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n');
  markdown = markdown.replace(/<h4>(.*?)<\/h4>/gi, '#### $1\n');
  markdown = markdown.replace(/<h5>(.*?)<\/h5>/gi, '##### $1\n');
  markdown = markdown.replace(/<h6>(.*?)<\/h6>/gi, '###### $1\n');

  // Bold
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b>(.*?)<\/b>/gi, '**$1**');

  // Italic
  markdown = markdown.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i>(.*?)<\/i>/gi, '*$1*');

  // Strikethrough
  markdown = markdown.replace(/<s>(.*?)<\/s>/gi, '~~$1~~');
  markdown = markdown.replace(/<del>(.*?)<\/del>/gi, '~~$1~~');

  // Code
  markdown = markdown.replace(/<code>(.*?)<\/code>/gi, '`$1`');

  // Links
  markdown = markdown.replace(/<a href="([^"]+)">(.*?)<\/a>/gi, '[$2]($1)');

  // Blockquotes
  markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n');

  // Horizontal rules
  markdown = markdown.replace(/<hr\s?\/?>/gi, '\n---\n');

  // Lists - Unordered
  markdown = markdown.replace(/<ul>([\s\S]*?)<\/ul>/gi, (match, content) => {
    const items = content.match(/<li>(.*?)<\/li>/gi);
    if (!items) return match;
    return items.map((item: string) => {
      const text = item.replace(/<\/?li>/gi, '').trim();
      return `- ${text}`;
    }).join('\n') + '\n';
  });

  // Lists - Ordered
  markdown = markdown.replace(/<ol>([\s\S]*?)<\/ol>/gi, (match, content) => {
    const items = content.match(/<li>(.*?)<\/li>/gi);
    if (!items) return match;
    return items.map((item: string, index: number) => {
      const text = item.replace(/<\/?li>/gi, '').trim();
      return `${index + 1}. ${text}`;
    }).join('\n') + '\n';
  });

  // Paragraphs
  markdown = markdown.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');

  // Line breaks
  markdown = markdown.replace(/<br\s?\/?>/gi, '\n');

  // Clean up remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();

  return markdown;
}
