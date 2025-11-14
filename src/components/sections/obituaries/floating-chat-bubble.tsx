"use client";

import { obituaryUpdateProcessingAtom } from "@/atoms/obituary-update";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input"; // Replaced with AI Elements version
import { MessageActions } from "@/components/ai/message-actions";
import { MessageFeedback } from "@/components/ai/message-feedback";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { convertToUIMessages } from "@/lib/ai/utils";
import { isEditingObituaryAtom } from "@/lib/state";
import { generateUUID } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAtomValue, useSetAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FloatingChatBubbleProps {
  documentId: string;
  initialChat?: {
    id: string;
    title: string;
    userId: string;
    entryId: string;
    createdAt: Date;
    visibility: "public" | "private";
  } | null;
  initialMessages?: Array<{
    id: string;
    chatId: string;
    role: string;
    parts: unknown;
    attachments: unknown;
    createdAt: Date;
  }>;
  position?: "bottom-right" | "bottom-left";
  defaultExpanded?: boolean;
}

export const FloatingChatBubble = ({
  documentId,
  initialChat,
  initialMessages = [],
  position = "bottom-right",
  defaultExpanded = false,
}: FloatingChatBubbleProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [input, setInput] = useState("");
  const [hasNewResponse, setHasNewResponse] = useState(false);
  
  // Jotai atom to coordinate loading state with ObituaryViewerSimple
  const setObituaryUpdateProcessing = useSetAtom(obituaryUpdateProcessingAtom);
  
  // Check if obituary is being edited - disable AI assistant during manual editing
  const isEditingObituary = useAtomValue(isEditingObituaryAtom);

  // React Compiler handles memoization - no useMemo needed
  const chatId = initialChat?.id || generateUUID();
  const convertedMessages = convertToUIMessages(initialMessages);

  const router = useRouter();

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
  } = useChat({
    id: chatId,
    messages: convertedMessages, // Pass directly instead of useEffect + setMessages
    transport: new DefaultChatTransport({
      api: `/api/create`,
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            message: messages.at(-1),
            documentId,
            visibility: "public",
            ...body,
          },
        };
      },
    }),
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      // Clear processing state on error
      setObituaryUpdateProcessing(false);
    },
    onFinish: () => {
      router.refresh();
      if (!isExpanded) {
        setHasNewResponse(true);
      }
      // Clear processing state when response completes
      setObituaryUpdateProcessing(false);
    },
  });

  // Clear notification when expanded
  useEffect(() => {
    if (isExpanded) {
      setHasNewResponse(false);
    }
  }, [isExpanded]);

  // React Compiler handles function stability - no useCallback needed
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Set processing state to show loading overlay on obituary
      setObituaryUpdateProcessing(true);
      sendMessage({ text: input });
      setInput("");
    }
  };

  const handleRegenerate = () => {
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMessage) {
      const text = lastUserMessage.parts
        .filter(p => p.type === "text")
        .map(p => (p as { type: "text"; text: string }).text)
        .join(" ");
      
      if (text) {
        setObituaryUpdateProcessing(true);
        sendMessage({ text });
      }
    }
  };

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col w-[550px] h-[700px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <Icon icon="mdi:sparkles" className="size-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">AI Editing Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setIsExpanded(false)}
              >
                <Icon icon="mdi:close" className="size-4" />
              </Button>
            </div>

            {/* Info Banner */}
            <div className="px-4 py-3 text-xs text-muted-foreground bg-muted/20 border-b border-border">
              Request suggestions, revisions, and make changes to your obituary
              by chatting below.
            </div>

            {/* Messages - Using AI Elements Conversation */}
            <Conversation className="flex-1">
              <ConversationContent>
                {messages.length === 0 && status === "ready" && !error ? (
                  <ConversationEmptyState
                    title="AI Editing Assistant"
                    description="Request suggestions, revisions, and make changes to your obituary by chatting below."
                    icon={
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                        <Icon icon="mdi:message-text-outline" className="size-8 text-primary/60" />
                      </div>
                    }
                  />
                ) : (
                  <>
                    {messages.map((message, messageIndex) => {
                      // Extract text content for actions
                      const messageText = message.parts
                        .filter(p => p.type === "text")
                        .map(p => (p as { type: "text"; text: string }).text)
                        .join("\n");
                      
                      // Check if this is the last assistant message
                      const assistantMessages = messages.filter(m => m.role === "assistant");
                      const isLastAssistantMessage = message.role === "assistant" && 
                        assistantMessages[assistantMessages.length - 1]?.id === message.id;

                      return (
                        <Message key={message.id} from={message.role}>
                          <MessageContent>
                            {message.parts.map((part, index) => {
                              if (part.type === "text") {
                                return (
                                  <div key={index}>
                                    <MessageResponse>{part.text}</MessageResponse>
                                  </div>
                                );
                              }
                              // Handle custom data parts (AI SDK v5 pattern)
                              if ("data" in part && typeof part.data === "object" && part.data !== null) {
                                const data = part.data as Record<string, unknown>;
                                if ("changeDescription" in data && typeof data.changeDescription === "string") {
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-start gap-2 text-xs"
                                    >
                                      <Icon
                                        icon="mdi:robot-outline"
                                        className="size-4 mt-0.5 flex-shrink-0"
                                      />
                                      <p>{data.changeDescription}</p>
                                    </div>
                                  );
                                }
                              }
                              return null;
                            })}
                          </MessageContent>
                          {/* Show actions and feedback for assistant messages, not during streaming */}
                          {message.role === "assistant" && status !== "streaming" && status !== "submitted" && (
                            <div className="flex items-center gap-2 mt-2">
                              <MessageActions
                                messageText={messageText}
                                messageId={message.id}
                                isLastMessage={isLastAssistantMessage}
                                onRegenerate={handleRegenerate}
                              />
                              <MessageFeedback
                                messageId={message.id}
                                chatId={chatId}
                              />
                            </div>
                          )}
                        </Message>
                      );
                    })}
                    
                    {/* Loading/Streaming Indicator */}
                    {(status === "streaming" || status === "submitted") && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                          </div>
                          {status === "streaming" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={stop}
                              className="h-6 px-2 text-xs"
                            >
                              Stop
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {error && (
                      <div className="text-center text-destructive text-sm bg-destructive/10 rounded-lg p-3">
                        {error.message}
                      </div>
                    )}
                  </>
                )}
              </ConversationContent>
            </Conversation>

            {/* Input */}
            <div className="border-t border-border bg-background p-3">
              <PromptInput onSubmit={(message, event) => handleSubmit(event)}>
                <PromptInputTextarea
                  placeholder="Ask AI to edit your obituary..."
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  className="min-h-[60px] max-h-[120px]"
                  disabled={status === "streaming" || status === "submitted"}
                />
                <PromptInputSubmit
                  status={status === "streaming" ? "streaming" : undefined}
                  disabled={!input.trim() || status === "streaming" || status === "submitted"}
                />
              </PromptInput>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isEditingObituary && setIsExpanded(true)}
            disabled={isEditingObituary}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg transition-all duration-200 ${
              isEditingObituary 
                ? "opacity-40 cursor-not-allowed" 
                : "hover:shadow-xl hover:scale-105"
            }`}
            aria-label={isEditingObituary ? "AI assistant disabled while editing" : "Open AI editing assistant"}
            title={isEditingObituary ? "Save your edits to use the AI assistant" : undefined}
          >
            <Icon icon="mdi:sparkles" className="size-6" />
            {hasNewResponse && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
            )}
            {status === "streaming" && (
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
