"use client";

interface SharedDocumentViewerProps {
  content: string;
}

export function SharedDocumentViewer({ content }: SharedDocumentViewerProps) {
  if (!content) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>This document is empty.</p>
      </div>
    );
  }

  // Split content into paragraphs and render with proper formatting
  const paragraphs = content.split(/\n\n+/);

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {paragraphs.map((paragraph, index) => {
        // Handle single line breaks within paragraphs
        const lines = paragraph.split(/\n/);

        return (
          <p key={index} className="mb-4 text-base leading-relaxed">
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {line}
                {lineIndex < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </article>
  );
}
