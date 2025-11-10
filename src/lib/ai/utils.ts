import { CoreMessage, UIMessage, UIMessagePart, convertToModelMessages as sdkConvertToModelMessages } from "ai";
import { formatISO } from "date-fns";
import { z } from "zod";
import type { Suggestion } from "../db/schema";

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type CustomUIDataTypes = {
  textDelta: string;
  suggestion: Suggestion;
  id: string;
  title: string;
};

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type ChatMessage = UIMessage<CustomUIDataTypes, MessageMetadata>;

export function convertToUIMessages(messages: any): ChatMessage[] {
  return messages.map((message: any) => ({
    id: message.id,
    role: message.role as "user" | "assistant" | "system",
    parts: message.parts as UIMessagePart<CustomUIDataTypes, any>[],
    metadata: {
      createdAt: formatISO(message.createdAt),
    },
  }));
}

export function getTextFromMessage(message: ChatMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/**
 * Truncates a tool call ID to 40 characters (OpenAI's maximum limit)
 * while attempting to maintain uniqueness
 */
function truncateToolCallId(id: string): string {
  if (id.length <= 40) return id;
  
  // Take the first 32 chars and last 8 chars to maintain some uniqueness
  // This ensures we keep both the prefix and a portion of the unique suffix
  return id.slice(0, 32) + id.slice(-8);
}

/**
 * Wrapper around convertToModelMessages that truncates tool call IDs to 40 characters
 * to comply with OpenAI's API requirements when using OpenRouter
 * 
 * @param messages - UI messages to convert
 * @returns Core messages with truncated tool call IDs
 */
export function convertToModelMessages(messages: any[]): CoreMessage[] {
  // Convert using SDK's function first
  const modelMessages = sdkConvertToModelMessages(messages);
  
  // Track ID mappings for tool results
  const idMapping = new Map<string, string>();
  
  // Process messages and truncate tool call IDs
  return modelMessages.map((message: any) => {
    if (message.role === 'assistant' && message.toolCalls && Array.isArray(message.toolCalls)) {
      // Truncate tool call IDs in assistant messages
      const truncatedToolCalls = message.toolCalls.map((toolCall: any) => {
        const originalId = String(toolCall.id);
        const truncatedId = truncateToolCallId(originalId);
        
        // Store mapping for later tool result matching
        idMapping.set(originalId, truncatedId);
        
        return {
          ...toolCall,
          id: truncatedId,
        };
      });
      
      return {
        ...message,
        toolCalls: truncatedToolCalls,
      };
    }
    
    if (message.role === 'tool' && message.toolCallId) {
      // Update tool result IDs to match truncated tool call IDs
      const originalId = String(message.toolCallId);
      const truncatedId = idMapping.get(originalId) || truncateToolCallId(originalId);
      
      return {
        ...message,
        toolCallId: truncatedId,
      };
    }
    
    return message;
  }) as CoreMessage[];
}