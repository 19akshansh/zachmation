import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { NonRetriableError } from "inngest";
import { setChannel } from "@/inngest/channels/executions/set";

type SetField = {
  key: string;
  valueTemplate: string;
};

type SetData = {
  fields: SetField[];
};

export const SetExecutor: NodeExecutor<SetData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, setChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.fields || data.fields.length === 0) {
    await step.realtime.publish(`node-error-fields-${nodeId}`, setChannel.status, {
      nodeId,
      status: "error",
    });
    throw new NonRetriableError("SET: No fields configured");
  }

  try {
    const result = await step.run(`set-${nodeId}`, async () => {
      const output: Record<string, unknown[]> = {};

      for (const field of data.fields) {
        const key = field.key?.trim();
        if (!key) continue;

        output[key] = [Handlebars.compile(field.valueTemplate ?? "")(context)];
      }

      return { ...context, ...output };
    });

    await step.realtime.publish(`node-success-${nodeId}`, setChannel.status, {
      nodeId,
      status: "success",
    });

    return result;
  } catch (error) {
    await step.realtime.publish(`node-error-runtime-${nodeId}`, setChannel.status, {
      nodeId,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};
