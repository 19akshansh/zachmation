import type { NodeExecutor } from "@/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channels/manualTrigger";

type manualReqTriggerData = Record<string, unknown>;

export const manualReqTriggerExecutor: NodeExecutor<
  manualReqTriggerData
> = async ({ nodeId, context, step }) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    manualTriggerChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  const result = await step.run(`httpTrigger-${nodeId}`, async () => context);

  await step.realtime.publish(
    `node-success-${nodeId}`,
    manualTriggerChannel.status,
    {
      nodeId,
      status: "success",
    },
  );

  return result;
};
