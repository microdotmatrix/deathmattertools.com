import { resolveAppliedCommentsAction } from "@/actions/apply-comments";
import { updateObituaryContent } from "@/actions/obituaries";
import { formatCommentsForAI } from "@/lib/ai/comment-formatter";
import { models } from "@/lib/ai/models";
import { assistantPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { convertToModelMessages, convertToUIMessages } from "@/lib/ai/utils";
import {
    getChatById,
    getMessageCountByUserId,
    getMessagesByChatId,
    saveChat,
    saveMessages,
} from "@/lib/db/queries/chats";
import { getApprovedCommentsForAI } from "@/lib/db/queries/comments-for-ai";
import { getDocumentById } from "@/lib/db/queries/documents";
import { generateUUID } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import {
    createUIMessageStream,
    createUIMessageStreamResponse,
    streamText,
} from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

// Route handlers are dynamic by default with cacheComponents
export async function POST(request: NextRequest) {
  const {
    message,
    documentId,
    id,
    visibility = "public",
  } = await request.json();

  const { userId } = await auth();

  const document = await getDocumentById(documentId);

  if (!document) {
    return new Response("Document not found", { status: 404 });
  }

  console.log("Attempting to get chat with ID:", id, "Type:", typeof id);

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    console.error("Invalid UUID format:", id);
    return new Response("Invalid chat ID format", { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = document.title;

    await saveChat({
      id,
      userId,
      entryId: document.entryId,
      documentId: document.id,
      documentCreatedAt: document.createdAt,
      title,
      visibility,
    });
  } else {
    if (chat.userId !== userId) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const messageCount = await getMessageCountByUserId({
    id: userId,
    differenceInHours: 24,
  });

  if (messageCount >= 50) {
    return new Response("You have reached the message limit", { status: 403 });
  }

  const messagesFromDb = await getMessagesByChatId({ id });
  const uiMessages = [...convertToUIMessages(messagesFromDb), message];

  // Fetch approved comments for AI context
  const approvedComments = await getApprovedCommentsForAI({
    documentId: document.id,
    documentCreatedAt: document.createdAt,
  });
  const commentContext = approvedComments.length > 0
    ? formatCommentsForAI(approvedComments)
    : "";

  // Generate proper UUID for message ID
  const messageId = generateUUID();

  await saveMessages({
    messages: [
      {
        chatId: id,
        id: messageId,
        role: "user",
        parts: message.parts,
        attachments: [],
        createdAt: new Date(),
      },
    ],
  });

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: models.assistant,
        system: assistantPrompt,
        messages: [
          {
            role: "system",
            content: updateDocumentPrompt(document.content),
          },
          // Include approved comments context if any exist
          ...(commentContext
            ? [
                {
                  role: "system" as const,
                  content: `${commentContext}\n\nWhen applying these comments, use the 'applyComments' tool to update the document and mark comments as resolved. For individual comment applications, use the standard 'updateDocument' tool.`,
                },
              ]
            : []),
          ...convertToModelMessages(uiMessages),
        ],
        tools: {
          updateDocument: {
            description:
              "Update the obituary document with revised content based on user's request",
            inputSchema: z.object({
              documentId: z
                .string()
                .describe("The ID of the document to update"),
              revisedContent: z
                .string()
                .describe(
                  "The complete revised content of the obituary document"
                ),
              changeDescription: z
                .string()
                .describe("Brief description of what changes were made"),
            }),
            execute: async (
              { revisedContent, changeDescription },
              { toolCallId }
            ) => {
              writer.write({
                type: "data-updateDocument",
                id: toolCallId,
                data: { changeDescription, status: "loading" },
              });

              // Use Server Action for update (handles revalidation properly)
              const result = await updateObituaryContent({
                documentId: document.id,
                entryId: document.entryId,
                content: revisedContent,
              });

              if (result.error) {
                writer.write({
                  type: "data-updateDocument",
                  id: toolCallId,
                  data: { changeDescription, revisedContent, status: "error" },
                });
                return { error: result.error };
              }

              writer.write({
                type: "data-updateDocument",
                id: toolCallId,
                data: { changeDescription, revisedContent, status: "success" },
              });

              return {
                success: true,
                message: `Document updated successfully. ${changeDescription}`,
                documentId: document.id,
                revisedContent,
                changeDescription,
              };
            },
          },
          applyComments: {
            description:
              "Apply approved comments to the obituary document and mark them as resolved. Use this tool when the user requests to apply all approved comments or when applying multiple comments at once.",
            inputSchema: z.object({
              documentId: z
                .string()
                .describe("The ID of the document to update"),
              revisedContent: z
                .string()
                .describe(
                  "The complete revised content of the obituary document with all approved comments applied"
                ),
              appliedCommentIds: z
                .array(z.string())
                .describe("Array of comment IDs that were applied in this update"),
              changeDescription: z
                .string()
                .describe("Summary of what changes were made based on the comments"),
            }),
            execute: async (
              { revisedContent, appliedCommentIds, changeDescription },
              { toolCallId }
            ) => {
              writer.write({
                type: "data-applyComments",
                id: toolCallId,
                data: {
                  changeDescription,
                  commentCount: appliedCommentIds.length,
                  status: "loading"
                },
              });

              // First, update the document content
              const updateResult = await updateObituaryContent({
                documentId: document.id,
                entryId: document.entryId,
                content: revisedContent,
              });

              if (updateResult.error) {
                writer.write({
                  type: "data-applyComments",
                  id: toolCallId,
                  data: {
                    changeDescription,
                    status: "error",
                    error: updateResult.error
                  },
                });
                return { error: updateResult.error };
              }

              // Then, mark the applied comments as resolved
              const resolveResult = await resolveAppliedCommentsAction(
                document.id,
                appliedCommentIds
              );

              if (resolveResult.error) {
                writer.write({
                  type: "data-applyComments",
                  id: toolCallId,
                  data: {
                    changeDescription,
                    status: "partial",
                    message: `Document updated but failed to resolve comments: ${resolveResult.error}`
                  },
                });
                return {
                  success: true,
                  warning: `Document updated but failed to resolve comments: ${resolveResult.error}`
                };
              }

              writer.write({
                type: "data-applyComments",
                id: toolCallId,
                data: {
                  changeDescription,
                  revisedContent,
                  status: "success",
                  resolvedCount: resolveResult.resolvedCount
                },
              });

              return {
                success: true,
                message: `Document updated successfully. Applied ${appliedCommentIds.length} comment(s) and marked them as resolved. ${changeDescription}`,
                documentId: document.id,
                revisedContent,
                changeDescription,
                resolvedCount: resolveResult.resolvedCount,
              };
            },
          },
        },
        onFinish: async ({ toolResults }) => {
          console.log("Obituary updated successfully");
        },
      });
      writer.merge(result.toUIMessageStream());
    },
    onFinish: async ({ messages }) => {
      await saveMessages({
        messages: messages.map((message) => ({
          id: generateUUID(), // Generate proper UUID for AI response messages
          role: message.role,
          parts: message.parts,
          attachments: [],
          chatId: id,
          createdAt: new Date(),
        })),
      });
    },
    onError: () => {
      return "Oops, an error occurred.";
    },
  });

  return createUIMessageStreamResponse({ stream });
}