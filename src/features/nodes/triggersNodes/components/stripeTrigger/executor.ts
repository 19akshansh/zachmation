import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { stripeTriggerChannel } from "@/inngest/channels/triggers/stripeTrigger";

type stripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<stripeTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    stripeTriggerChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  const result = await step.run(`stripeTrigger-${nodeId}`, async () => context);

  await step.realtime.publish(
    `node-success-${nodeId}`,
    stripeTriggerChannel.status,
    {
      nodeId,
      status: "success",
    },
  );

  return result;
};
