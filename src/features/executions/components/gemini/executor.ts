import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { geminiChannel } from "@/inngest/channels/ai/gemini";
import { GoogleModelId } from "@/config/ai/geminiModels";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);

  return new Handlebars.SafeString(stringified);
});

type GeminiData = {
  variableName?: string;
  credentialId?: string;
  model?: GoogleModelId;
  systemPrompt?: string;
  userPrompt?: string;
};

export const GeminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, geminiChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.variableName) {
    await step.realtime.publish(
      `node-error-variable-${nodeId}`,
      geminiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("GEMINI: No variable name configured");
  }

  if (!data.userPrompt) {
    await step.realtime.publish(
      `node-error-userprompt-${nodeId}`,
      geminiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("GEMINI: No User Prompt configured");
  }

  if (!data.credentialId) {
    await step.realtime.publish(
      `node-error-credential-${nodeId}`,
      geminiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("GEMINI: No Credential configured");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run(
    `node-error-get-credential-${nodeId}`,
    () => {
      return prisma.credential.findUnique({
        where: {
          id: data.credentialId,
        },
      });
    },
  );

  if (!credential) {
    throw new NonRetriableError("GEMINI: Credential not found");
  }

  const apiKey = credential.value;

  try {
    const google = createGoogleGenerativeAI({
      apiKey,
    });

    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(data.model || "gemini-1.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await step.realtime.publish(
      `node-success-${nodeId}`,
      geminiChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      geminiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw error;
  }
};
