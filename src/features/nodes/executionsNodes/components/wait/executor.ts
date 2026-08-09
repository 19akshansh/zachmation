import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { waitChannel } from "@/inngest/channels/executions/wait";

export type WaitData = {
  mode?: "duration" | "webhook";
  durationMs?: number;
  variableName?: string;
};

export const WaitExecutor: NodeExecutor<WaitData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, waitChannel.status, {
    nodeId,
    status: "loading",
  });

  if (data.mode === "duration") {
    if (!data.durationMs || data.durationMs < 1000) {
      await step.realtime.publish(
        `node-error-config-${nodeId}`,
        waitChannel.status,
        {
          nodeId,
          status: "error",
        },
      );
      throw new NonRetriableError("WAIT: No valid duration configured");
    }

    await step.sleep(`wait-${nodeId}`, data.durationMs);

    await step.realtime.publish(`node-success-${nodeId}`, waitChannel.status, {
      nodeId,
      status: "success",
    });

    return context;
  }

  if (data.mode !== "webhook") {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      waitChannel.status,
      {
        nodeId,
        status: "error",
      },
    );
    throw new NonRetriableError("WAIT: Invalid wait mode");
  }

  const resumeEvent = await step.waitForEvent(`wait-resume-${nodeId}`, {
    event: "workflow/wait.resumed",
    if: `async.data.nodeId == "${nodeId}"`,
    timeout: "7d",
  });

  if (!resumeEvent) {
    await step.realtime.publish(`node-error-timeout-${nodeId}`, waitChannel.status, {
      nodeId,
      status: "error",
    });
    throw new NonRetriableError("WAIT: Timed out waiting for resume webhook");
  }

  await step.realtime.publish(`node-success-${nodeId}`, waitChannel.status, {
    nodeId,
    status: "success",
  });

  return data.variableName
    ? { ...context, [data.variableName]: [resumeEvent.data.payload] }
    : context;
};
