"use client"

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import nextDynamic from "next/dynamic";
import { useState } from "react";

// Dynamic import for heavy AI chat component (~150KB+ savings)
// Uses ssr: false since it relies on browser APIs and client-side state
const FloatingChatBubble = nextDynamic(
  () => import("@/components/sections/obituaries/floating-chat-bubble").then((mod) => mod.FloatingChatBubble),
  {
    ssr: false,
    loading: () => null, // No loading indicator needed for floating bubble
  }
);

interface DynamicChatProps {
  access: {
    document: {
      id: string;
    };
  };
  chatData: {
    chat: {
      id: string;
      title: string;
      userId: string;
      entryId: string;
      createdAt: Date;
      visibility: "public" | "private";
    } | null;
    messages: Array<{
      id: string;
      chatId: string;
      role: string;
      parts: unknown;
      attachments: unknown;
      createdAt: Date;
    }>;
  };
}

export const DynamicChat = ({ access, chatData }: DynamicChatProps) => {
  const [isChatLoaded, setIsChatLoaded] = useState(false);

  return (
    <>
      {/* Trigger button - loads chat on first click */}
      {!isChatLoaded && (
        <Button
          onClick={() => setIsChatLoaded(true)}
          className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
          size="icon"
          aria-label="Open AI Assistant"
        >
          <Icon icon="mdi:robot-outline" className="h-6 w-6" />
        </Button>
      )}

      {/* Load chat bubble only after user clicks */}
      {isChatLoaded && (
        <FloatingChatBubble
          documentId={access.document.id}
          initialChat={chatData.chat}
          initialMessages={chatData.messages}
          defaultExpanded
        />
      )}
    </>
  )
}