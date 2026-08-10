import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { discordTriggerChannel } from "@/inngest/channels/triggers/discordTrigger";

type DiscordTriggerData = Record<string, unknown>;

export const discordTriggerExecutor: NodeExecutor<DiscordTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    discordTriggerChannel.status,
    { nodeId, status: "loading" },
  );

  const result = await step.run(
    `discordTrigger-${nodeId}`,
    async () => context,
  );

  await step.realtime.publish(
    `node-success-${nodeId}`,
    discordTriggerChannel.status,
    { nodeId, status: "success" },
  );

  return result;
};
