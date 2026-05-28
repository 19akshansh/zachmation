import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/executionsNodes/types";
import { NonRetriableError } from "inngest";
import { discordChannel } from "@/inngest/channels/discord";
import { decode } from "html-entities";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);

  return new Handlebars.SafeString(stringified);
});

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const DiscordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, discordChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.content) {
    await step.realtime.publish(
      `node-error-content-${nodeId}`,
      discordChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("DISCORD: No Message Content configured");
  }

  const rawMessageContent = Handlebars.compile(data.content)(context);
  const messageContent = decode(rawMessageContent);

  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  try {
    const result = await step.run("discord-webhook", async () => {
      if (!data.webhookUrl) {
        await step.realtime.publish(
          `node-error-webhookurl-${nodeId}`,
          discordChannel.status,
          {
            nodeId,
            status: "error",
          },
        );

        throw new NonRetriableError("DISCORD: No Webhook URL configured");
      }

      if (!data.variableName) {
        await step.realtime.publish(
          `node-error-variable-${nodeId}`,
          discordChannel.status,
          {
            nodeId,
            status: "error",
          },
        );

        throw new NonRetriableError("DISCORD: No variable name configured");
      }

      await ky.post(data.webhookUrl, {
        json: {
          content: messageContent.slice(0, 2000),
          username,
        },
      });

      return {
        ...context,
        [data.variableName]: {
          text: messageContent.slice(0, 2000),
        },
      };
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      discordChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return result;
  } catch (error) {
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      discordChannel.status,
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
