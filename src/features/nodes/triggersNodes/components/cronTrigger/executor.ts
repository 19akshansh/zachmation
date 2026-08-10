import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { cronTriggerChannel } from "@/inngest/channels/triggers/cronTrigger";

type CronTriggerData = Record<string, unknown>;

export const CronTriggerExecutor: NodeExecutor<CronTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    cronTriggerChannel.status,
    { nodeId, status: "loading" },
  );

  const result = await step.run(`cron-trigger-${nodeId}`, async () => context);

  await step.realtime.publish(
    `node-success-${nodeId}`,
    cronTriggerChannel.status,
    { nodeId, status: "success" },
  );

  return result;
};
