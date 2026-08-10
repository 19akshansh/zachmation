import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { NonRetriableError } from "inngest";
import { decode } from "html-entities";
import ky from "ky";
import { slackChannel } from "@/inngest/channels/executions/slack";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);

  return new Handlebars.SafeString(stringified);
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const SlackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, slackChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.content) {
    await step.realtime.publish(
      `node-error-content-${nodeId}`,
      slackChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("SLACK: No Message Content configured");
  }

  const rawMessageContent = Handlebars.compile(data.content)(context);
  const messageContent = decode(rawMessageContent);

  try {
    const result = await step.run("slack-webhook", async () => {
      if (!data.webhookUrl) {
        await step.realtime.publish(
          `node-error-webhookurl-${nodeId}`,
          slackChannel.status,
          {
            nodeId,
            status: "error",
          },
        );

        throw new NonRetriableError("SLACK: No Webhook URL configured");
      }

      if (!data.variableName) {
        await step.realtime.publish(
          `node-error-variable-${nodeId}`,
          slackChannel.status,
          {
            nodeId,
            status: "error",
          },
        );

        throw new NonRetriableError("SLACK: No variable name configured");
      }

      await ky.post(data.webhookUrl, {
        json: {
          text: messageContent,
        },
      });

      return {
        ...context,
        [data.variableName]: [
          {
            text: messageContent,
          },
        ],
      };
    });

    await step.realtime.publish(`node-success-${nodeId}`, slackChannel.status, {
      nodeId,
      status: "success",
    });

    return result;
  } catch (error) {
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      slackChannel.status,
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
