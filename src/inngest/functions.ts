import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "exec/ai" },
  async ({ event, step }) => {
    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text", 
      generateText, 
      {
        system: "You are a helpful assistance",
        prompt: "2+2 =?",
        model: google("gemini-2.5-flash"),
      },
    );

    const { steps: openaiSteps } = await step.ai.wrap(
      "openai-generate-text", 
      generateText, 
      {
        system: "You are a helpful assistance",
        prompt: "2+2 =?",
        model: openai("gpt-4"),
      },
    );
    
    const { steps: anthropicSteps } = await step.ai.wrap(
      "anthropic-generate-text", 
      generateText, 
      {
        system: "You are a helpful assistance",
        prompt: "2+2 =?",
        model: anthropic("claude-sonnet-4-5"),
      },
    );

    return {
      geminiSteps,
      openaiSteps,
      anthropicSteps,
    };
  },
);