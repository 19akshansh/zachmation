import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { telegramTriggerChannel } from "@/inngest/channels/triggers/telegramTrigger";

type TelegramTriggerData = Record<string, unknown>;

export const telegramTriggerExecutor: NodeExecutor<TelegramTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    telegramTriggerChannel.status,
    { nodeId, status: "loading" },
  );

  const result = await step.run(`telegramTrigger-${nodeId}`, async () => context);

  await step.realtime.publish(
    `node-success-${nodeId}`,
    telegramTriggerChannel.status,
    { nodeId, status: "success" },
  );

  return result;
};
