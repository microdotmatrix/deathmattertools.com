"use client";

import { Streamdown } from "streamdown";

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

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <Streamdown className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {content}
      </Streamdown>
    </article>
  );
}
