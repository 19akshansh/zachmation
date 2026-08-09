import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { NonRetriableError } from "inngest";
import { loopChannel } from "@/inngest/channels/executions/loop";

type LoopData = {
  sourceKey?: string;
  variableName?: string;
};

export const LoopExecutor: NodeExecutor<LoopData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, loopChannel.status, {
    nodeId,
    status: "loading",
  });

  try {
    if (!data.sourceKey?.trim()) {
      throw new NonRetriableError("LOOP: No source array configured");
    }

    if (!data.variableName?.trim()) {
      throw new NonRetriableError("LOOP: No result variable configured");
    }

    const source = context[data.sourceKey.trim()];
    if (!Array.isArray(source)) {
      throw new NonRetriableError(
        `LOOP: Context key "${data.sourceKey}" is not an array`,
      );
    }

    await step.realtime.publish(`node-success-${nodeId}`, loopChannel.status, {
      nodeId,
      status: "success",
    });

    return context;
  } catch (error) {
    await step.realtime.publish(`node-error-${nodeId}`, loopChannel.status, {
      nodeId,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};
