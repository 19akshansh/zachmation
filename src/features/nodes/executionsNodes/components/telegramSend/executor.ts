import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { NonRetriableError } from "inngest";
import { telegramSendChannel } from "@/inngest/channels/executions/telegramSend";
import { decode } from "html-entities";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import ky from "ky";

type TelegramSendData = {
  variableName?: string;
  credentialId?: string;
  chatId?: string;
  message?: string;
};

export const TelegramSendExecutor: NodeExecutor<TelegramSendData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    telegramSendChannel.status,
    { nodeId, status: "loading" },
  );

  if (!data.message) {
    await step.realtime.publish(
      `node-error-message-${nodeId}`,
      telegramSendChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError("TELEGRAM SEND: No message configured");
  }
  if (!data.credentialId || !data.chatId || !data.variableName) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      telegramSendChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      "TELEGRAM SEND: Missing credential, chat id, or variable name",
    );
  }

  const messageText = decode(Handlebars.compile(data.message)(context));
  const chatId = Handlebars.compile(data.chatId)(context);

  try {
    const result = await step.run(`telegram-send-${nodeId}`, async () => {
      const credential = await prisma.credential.findFirst({
        where: { id: data.credentialId, userId, type: "TELEGRAM_BOT" },
      });
      if (!credential)
        throw new NonRetriableError(
          "TELEGRAM SEND: Credential not found or not owned by this user",
        );

      const botToken = decrypt(credential.value);
      const response = await ky
        .post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          json: { chat_id: chatId, text: messageText.slice(0, 4096) },
        })
        .json<unknown>();

      return {
        ...context,
        [data.variableName!]: [
          {
            text: messageText.slice(0, 4096),
            telegramResponse: response,
          },
        ],
      };
    });
    await step.realtime.publish(
      `node-success-${nodeId}`,
      telegramSendChannel.status,
      { nodeId, status: "success" },
    );
    return result;
  } catch (error) {
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      telegramSendChannel.status,
      {
        nodeId,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    );
    throw error;
  }
};
