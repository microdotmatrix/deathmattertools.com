"use client";

import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai/prompt-input";
import { Response } from "@/components/ai/response";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { convertToUIMessages } from "@/lib/ai/utils";
import { generateUUID } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { obituaryUpdateProcessingAtom } from "@/atoms/obituary-update";
import { DefaultChatTransport } from "ai";
import { useSetAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Jotai atom to coordinate loading state with ObituaryViewerSimple
  const setObituaryUpdateProcessing = useSetAtom(obituaryUpdateProcessingAtom);

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded]);

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
            className="flex flex-col w-[400px] h-[560px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 && (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return (
                            <div key={index} className="flex items-start gap-2">
                              <Response>{part.text}</Response>
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
                    </div>
                </div>
                ))
              )}
              
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
              
              {/* Empty State - Only show when no messages and not processing */}
              {messages.length === 0 && status === "ready" && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-sm gap-3">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <Icon icon="mdi:message-text-outline" className="size-8 text-primary/60" />
                  </div>
                  <div>
                    <p className="font-medium">Start a conversation</p>
                    <p className="text-xs mt-1">
                      Ask for tone adjustments, content additions, or any improvements
                    </p>
                  </div>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

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
                <div className="flex justify-end pt-2">
                  <PromptInputSubmit
                    status={status === "streaming" ? "streaming" : undefined}
                    disabled={!input.trim() || status === "streaming" || status === "submitted"}
                  />
                </div>
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
            onClick={() => setIsExpanded(true)}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            aria-label="Open AI editing assistant"
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
