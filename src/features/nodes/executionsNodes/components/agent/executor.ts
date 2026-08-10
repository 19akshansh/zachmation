import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, stepCountIs, tool, type ToolSet } from "ai";
import { z } from "zod";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { agentChannel } from "@/inngest/channels/ai/agent";
import { searchMemory } from "@/lib/vectorMemory";
import { safeWebFetch } from "@/lib/safeWebFetch";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

type AgentData = {
  variableName?: string;
  credentialId?: string;
  systemPrompt?: string;
  userMessage?: string;
  memoryNamespace?: string;
  maxSteps?: number;
};

export const AgentExecutor: NodeExecutor<AgentData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, agentChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.variableName?.trim()) {
    throw new NonRetriableError("AGENT: No result variable configured");
  }
  if (!data.userMessage?.trim()) {
    throw new NonRetriableError("AGENT: No user message configured");
  }
  if (!data.credentialId) {
    throw new NonRetriableError("AGENT: No Gemini credential configured");
  }

  const credential = await step.run(`agent-get-credential-${nodeId}`, () =>
    prisma.credential.findFirst({
      where: {
        id: data.credentialId,
        userId,
        type: "GEMINI",
      },
    }),
  );

  if (!credential) {
    throw new NonRetriableError(
      "AGENT: Gemini credential not found or not owned by this user",
    );
  }

  const apiKey = decrypt(credential.value);
  const systemPrompt = data.systemPrompt?.trim()
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful and precise workflow agent. Use tools only when they improve the answer. Never claim to have accessed information you did not retrieve.";
  const userMessage = Handlebars.compile(data.userMessage)(context);
  const memoryNamespace = data.memoryNamespace?.trim()
    ? Handlebars.compile(data.memoryNamespace)(context).trim()
    : "";
  const maxSteps = Math.min(Math.max(data.maxSteps ?? 5, 1), 10);

  const webFetch = tool({
    description:
      "Fetch a public web page over HTTP(S) and return its readable text. Use this for public information that is not already available in the workflow context or memory.",
    inputSchema: z.object({
      url: z.string().url().describe("The public HTTP(S) URL to fetch"),
    }),
    execute: async ({ url }) => safeWebFetch(url),
  });

  const searchMemoryTool = memoryNamespace
    ? tool({
        description:
          "Search the workflow's long-term vector memory for semantically relevant information. Only search the configured namespace.",
        inputSchema: z.object({
          query: z
            .string()
            .min(1)
            .describe("What information to retrieve from memory"),
          limit: z
            .number()
            .int()
            .min(1)
            .max(10)
            .optional()
            .describe("Maximum results"),
        }),
        execute: async ({ query, limit }) =>
          searchMemory({
            userId,
            namespace: memoryNamespace,
            query,
            limit: Math.min(Math.max(limit ?? 5, 1), 10),
            geminiApiKey: apiKey,
          }),
      })
    : undefined;

  const tools: ToolSet = { webFetch };

  if (searchMemoryTool) {
    tools.searchMemory = searchMemoryTool;
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey });

    const { text } = await step.ai.wrap(
      `agent-generate-${nodeId}`,
      generateText,
      {
        model: google("gemini-2.5-flash"),
        system: systemPrompt,
        prompt: userMessage,
        tools,
        stopWhen: stepCountIs(maxSteps),
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    await step.realtime.publish(`node-success-${nodeId}`, agentChannel.status, {
      nodeId,
      status: "success",
    });

    return {
      ...context,
      [data.variableName]: [
        {
          text,
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      agentChannel.status,
      {
        nodeId,
        status: "error",
        error: message,
      },
    );

    throw error;
  }
};
