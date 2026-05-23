import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { openaiChannel } from "@/inngest/channels/ai/openai";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

type openAIData = {
  variableName?: string;
  model?: openaiModels;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openAIExecutor: NodeExecutor<openAIData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, openAIChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.variableName) {
    await step.realtime.publish(
      `node-error-variable-${nodeId}`,
      openaiChannel.status,
      {
        nodeId,
        status: "error",
      }
    );

    throw new NonRetriableError("OPENAI: No variable name configured");
  }

  if (!data.userPrompt) {
    await step.realtime.publish(
      `node-error-userprompt-${nodeId}`,
      openaiChannel.status,
      {
        nodeId,
        status: "error",
      }
    );

    throw new NonRetriableError("OPENAI: No User Prompt configured");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";
  const userPrompt = Handlebars.compile(data.userPrompt)(context);
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const openai = createOpenAI({
      apiKey,
    });

    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai(data.model || "gpt-4.1"),
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
      openaiChannel.status,
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
      openaiChannel.status,
      {
        nodeId,
        status: "error",
      }
    );

    throw error;
  }
};
