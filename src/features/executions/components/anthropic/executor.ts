import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { NodeExecutor } from "@/features/executions/types";
import { anthropicChannel } from "@/inngest/channels/ai/anthropic";
import { AnthropicModelId } from "@/config/ai/anthropicModels";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);

  return new Handlebars.SafeString(stringified);
});

type AnthropicData = {
  variableName?: string;
  model?: AnthropicModelId;
  systemPrompt?: string;
  userPrompt?: string;
};

export const AnthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    anthropicChannel.status,
    {
      nodeId,
      status: "loading",
    }
  );

  if (!data.variableName) {
    await step.realtime.publish(
      `node-error-variable-${nodeId}`,
      anthropicChannel.status,
      {
        nodeId,
        status: "error",
      }
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
      }
    );

    throw new NonRetriableError("ANTHROPIC: No User Prompt configured");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    await step.realtime.publish(
      `node-error-apikey-${nodeId}`,
      anthropicChannel.status,
      {
        nodeId,
        status: "error",
      }
    );

    throw new NonRetriableError("Missing Anthropic API Key");
  }

  try {
    const anthropic = createAnthropic({
      apiKey,
    });

    const { text } = await step.ai.wrap(
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
      }
    );

    await step.realtime.publish(
      `node-success-${nodeId}`,
      anthropicChannel.status,
      {
        nodeId,
        status: "success",
      }
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
      anthropicChannel.status,
      {
        nodeId,
        status: "error",
      }
    );

    throw error;
  }
};
