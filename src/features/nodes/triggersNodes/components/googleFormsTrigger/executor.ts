import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { googleFormTriggerChannel } from "@/inngest/channels/triggers/googleFormTrigger";

type googleFormTriggerData = Record<string, unknown>;

export const googleFormTriggerExecutor: NodeExecutor<
  googleFormTriggerData
> = async ({ nodeId, context, step }) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    googleFormTriggerChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  const result = await step.run(
    `googleFormTrigger-${nodeId}`,
    async () => context,
  );

  await step.realtime.publish(
    `node-success-${nodeId}`,
    googleFormTriggerChannel.status,
    {
      nodeId,
      status: "success",
    },
  );

  return result;
};
