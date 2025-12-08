"use client";

import { MessageResponse } from "@/components/ai-elements/message";

interface ObituaryViewerProps {
  id?: string;
  content?: string;
}

export const ObituaryViewer = ({ id, content }: ObituaryViewerProps) => {
  return (
    <div className="prose dark:prose-invert prose-md lg:prose-lg max-w-4xl lg:mx-12">
      <MessageResponse key={id}>{content}</MessageResponse>
    </div>
  );
};