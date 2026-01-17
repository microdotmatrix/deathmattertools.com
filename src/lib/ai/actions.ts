"use server";

import { saveDocument } from "@/lib/db/mutations/documents";
import { updateQuoteUsageAction } from "@/lib/db/mutations/quotes";
import { createStreamableValue } from "@ai-sdk/rsc";
import { auth } from "@clerk/nextjs/server";
import { smoothStream, streamText } from "ai";
import { z } from "zod";
import { selectExamples } from "./few-shot-examples";
import { models } from "./models";
import {
    createFewShotSystemPrompt,
    createPromptFromEntryData,
    createPromptFromFile,
    OBITUARY_LENGTH_CONFIG,
    type ObituaryLength
} from "./prompts";

const ObitFormSchema = z.object({
  name: z.string(),
  style: z.string(),
  tone: z.string(),
  length: z.enum(["short", "medium", "long"]).default("medium"),
  toInclude: z.string(),
  toAvoid: z.string(),
  isReligious: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  selectedQuoteIds: z.string().optional().default(""),
});

/**
 * Generate a descriptive title for the obituary based on style, tone, length, and religious content
 * @param style - The style of the obituary (e.g., "traditional", "modern", "personal")
 * @param tone - The tone of the obituary (e.g., "reverent", "celebratory", "contemporary")
 * @param length - The length of the obituary (short, medium, long)
 * @param isReligious - Whether religious content is included
 * @returns A formatted title string
 */
function generateObituaryTitle(
  style: string,
  tone: string,
  length: ObituaryLength,
  isReligious: boolean
): string {
  // Capitalize first letter of each word
  const capitalizeWords = (str: string) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const formattedStyle = capitalizeWords(style);
  const formattedTone = capitalizeWords(tone);
  const lengthLabel = OBITUARY_LENGTH_CONFIG[length].label;

  // Build the title with style, tone, and length
  let title = `${formattedStyle} ${formattedTone} (${lengthLabel})`;

  // Add religious indicator as a badge
  if (isReligious) {
    title += " 🕊️"; // Adding a dove emoji as a visual indicator
  }

  return title;
}

export const generateObituary = async (
  entryId: string,
  // languageModel: LanguageModel = models.openai,
  { data }: { data: FormData }
) => {
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // let stream = createStreamableValue("");

  try {
    const { name, style, tone, length, toInclude, toAvoid, isReligious, selectedQuoteIds } =
      ObitFormSchema.parse(Object.fromEntries(data));

    const prompt = await createPromptFromEntryData(
      entryId,
      style,
      tone,
      length,
      toInclude,
      toAvoid,
      isReligious,
      selectedQuoteIds
    );

    // Select relevant few-shot examples based on user criteria
    const examples = selectExamples({
      tone,
      style,
      isReligious,
      hasQuotes: !!selectedQuoteIds,
      hasMilitaryService: false, // TODO: detect from entry data if needed
    });

    // Build message history with examples (few-shot learning)
    const messages = [
      // Add examples as conversation pairs (user facts -> assistant obituary)
      ...examples.flatMap(ex => [
        { role: "user" as const, content: ex.facts },
        { role: "assistant" as const, content: ex.obituary }
      ]),
      // Add the actual request
      { role: "user" as const, content: prompt }
    ];

    let tokenUsage: number | undefined = 0;
    let generatedContent = "";
    let id = crypto.randomUUID();

    const { textStream } = streamText({
      model: models.writer,
      system: createFewShotSystemPrompt(length), // Use few-shot system prompt with dynamic length
      messages, // Use message history instead of single message
      experimental_transform: smoothStream({ chunking: "word" }),
      onFinish: async ({ usage, text }) => {
        const { totalTokens } = usage;

        tokenUsage = totalTokens;
        await saveDocument({
          id,
          title: generateObituaryTitle(style, tone, length, isReligious),
          content: text,
          tokenUsage,
          kind: "obituary",
          entryId,
          userId,
          organizationId: orgId,
        });

        // Mark selected quotes as used in obituary
        if (selectedQuoteIds) {
          const ids = selectedQuoteIds.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id));
          for (const quoteId of ids) {
            const formData = new FormData();
            formData.append("id", quoteId.toString());
            formData.append("usedInObituary", "true");
            await updateQuoteUsageAction({} as any, formData);
          }
        }
      },
    });

    return {
      success: true,
      result: createStreamableValue(textStream).value,
      id,
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to generate obituary",
    };
  }
};

const ObitFromFileSchema = z.object({
  name: z.string(),
  instructions: z.string().optional(),
  length: z.enum(["short", "medium", "long"]).default("medium"),
  file: z.base64(),
});

export const generateObituaryFromDocument = async (
  entryId: string,
  { data }: { data: FormData }
) => {
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // let stream = createStreamableValue("");

  try {
    const { name, instructions, length, file } = ObitFromFileSchema.parse(
      Object.fromEntries(data)
    );

    const prompt = await createPromptFromFile(entryId, instructions);

    // Select few-shot examples to establish output quality and structure
    // Use generic criteria since we don't have style/tone from document upload
    const examples = selectExamples({
      tone: "reverent", // Default to reverent tone
      style: "traditional", // Default to traditional style
      isReligious: false,
      hasQuotes: false,
      hasMilitaryService: false,
    }, 2); // Use only 2 examples to save tokens with large document content

    // Build message history with text-only examples first
    const messages = [
      // Add examples as conversation pairs (text-only)
      ...examples.flatMap(ex => [
        { role: "user" as const, content: ex.facts },
        { role: "assistant" as const, content: ex.obituary }
      ]),
      // Add the actual request with document
      {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: prompt,
          },
          {
            type: "file" as const,
            filename: name,
            mediaType: "application/pdf",
            data: file,
          },
        ],
      },
    ];

    let tokenUsage: number | undefined = 0;

    const id = crypto.randomUUID();

    const result = streamText({
      model: models.anthropic,
      system: createFewShotSystemPrompt(length), // Use few-shot system prompt with dynamic length
      messages,
      experimental_transform: smoothStream({ chunking: "word" }),
      onFinish: async ({ usage, text }) => {
        const { totalTokens } = usage;

        tokenUsage = totalTokens;
        await saveDocument({
          id,
          title: generateObituaryTitle("traditional", "reverent", length, false), // Default style/tone with user-selected length
          content: text,
          tokenUsage,
          kind: "obituary",
          entryId,
          userId,
          organizationId: orgId,
        });
      },
    });

    return {
      success: true,
      result: createStreamableValue(result.textStream).value,
      id,
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to generate obituary",
    };
  }
};

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: React.ReactNode;
}
