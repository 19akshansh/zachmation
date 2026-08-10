import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { webhookTriggerChannel } from "@/inngest/channels/triggers/webhookTrigger";

type WebhookTriggerData = Record<string, unknown>;

export const webhookTriggerExecutor: NodeExecutor<WebhookTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    webhookTriggerChannel.status,
    { nodeId, status: "loading" },
  );

  const result = await step.run(
    `webhookTrigger-${nodeId}`,
    async () => context,
  );

  await step.realtime.publish(
    `node-success-${nodeId}`,
    webhookTriggerChannel.status,
    { nodeId, status: "success" },
  );

  return result;
};
