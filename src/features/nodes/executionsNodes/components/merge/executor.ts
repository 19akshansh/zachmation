import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "../../types";
import { mergeChannel } from "@/inngest/channels/executions/merge";

type MergeData = {
  variableName?: string;
  input1Key?: string;
  input2Key?: string;
  mode?: "append";
};

export const MergeExecutor: NodeExecutor<MergeData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, mergeChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.variableName || !data.input1Key || !data.input2Key) {
    await step.realtime.publish(`node-error-config-${nodeId}`, mergeChannel.status, {
      nodeId,
      status: "error",
    });
    throw new NonRetriableError("MERGE: Missing variable name or input keys");
  }

  try {
    const result = await step.run(`merge-${nodeId}`, async () => {
      const input1 = (context[data.input1Key!] as unknown[] | undefined) ?? [];
      const input2 = (context[data.input2Key!] as unknown[] | undefined) ?? [];

      return {
        ...context,
        [data.variableName!]: [...input1, ...input2],
      };
    });

    await step.realtime.publish(`node-success-${nodeId}`, mergeChannel.status, {
      nodeId,
      status: "success",
    });

    return result;
  } catch (error) {
    await step.realtime.publish(`node-error-runtime-${nodeId}`, mergeChannel.status, {
      nodeId,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};
