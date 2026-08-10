import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { anthropicChannel } from "@/inngest/channels/ai/anthropic";
import { AnthropicModelId } from "@/config/ai/anthropicModels";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);

  return new Handlebars.SafeString(stringified);
});

type AnthropicData = {
  variableName?: string;
  credentialId?: string;
  model?: AnthropicModelId;
  systemPrompt?: string;
  userPrompt?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    anthropicChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  if (!data.variableName) {
    await step.realtime.publish(
      `node-error-variable-${nodeId}`,
      anthropicChannel.status,
      {
        nodeId,
        status: "error",
        error: "No variable name configured",
      },
    );

    throw new NonRetriableError("ANTHROPIC: No variable name configured");
  }

  if (!data.userPrompt) {
    await step.realtime.publish(
      `node-error-userprompt-${nodeId}`,
      anthropicChannel.status,
      {
        nodeId,
        status: "error",
        error: "No User Prompt configured",
      },
    );

    throw new NonRetriableError("ANTHROPIC: No User Prompt configured");
  }

  if (!data.credentialId) {
    await step.realtime.publish(
      `node-error-credential-${nodeId}`,
      anthropicChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("ANTHROPIC: No Credential configured");
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
          userId,
        },
      });
    },
  );

  if (!credential) {
    throw new NonRetriableError("ANTHROPIC: Credential not found");
  }

  try {
    const anthropic = createAnthropic({
      apiKey: decrypt(credential.value),
    });

    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic(data.model || "claude-3-5-sonnet-latest"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    const text =
      steps?.[0]?.content?.[0]?.type === "text" ? steps[0].content[0].text : "";

    await step.realtime.publish(
      `node-success-${nodeId}`,
      anthropicChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return {
      ...context,
      [data.variableName]: [
        {
          text,
        },
      ],
    };
  } catch (error) {
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      anthropicChannel.status,
      {
        nodeId,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 300));

    throw error;
  }
};
