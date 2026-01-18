import { env } from "@/lib/env/server";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

export const models = {
  openai: openai("gpt-4o-mini"),
  anthropic: anthropic("claude-3-5-sonnet-20240620"),
  openrouter: openrouter("google/gemini-2.5-pro"),
  writer: openrouter("@preset/obituary-writer"),
  assistant: openrouter("@preset/obituary-assistant"), // Use Claude via OpenRouter with ID truncation
  summarizer: openrouter("gpt-4o-mini"),
};