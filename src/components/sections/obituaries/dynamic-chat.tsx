"use client"

import nextDynamic from "next/dynamic";

// Dynamic import for heavy AI chat component (~150KB+ savings)
// Uses ssr: false since it relies on browser APIs and client-side state
const FloatingChatBubble = nextDynamic(
  () => import("@/components/sections/obituaries/floating-chat-bubble").then((mod) => mod.FloatingChatBubble),
  { 
    ssr: false,
    loading: () => null, // No loading indicator needed for floating bubble
  }
);

export const DynamicChat = ({ access, chatData }: { access: any, chatData: any }) => {
  return (
    <FloatingChatBubble
      documentId={access.document.id}
      initialChat={chatData.chat}
      initialMessages={chatData.messages}
    />
  )
}