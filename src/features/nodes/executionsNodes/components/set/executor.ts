import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { NonRetriableError } from "inngest";
import { setChannel } from "@/inngest/channels/executions/set";

type SetValueType = "string" | "number" | "boolean" | "array";

type SetField = {
  key: string;
  valueTemplate: string;
  type?: SetValueType;
};

type SetData = {
  fields: SetField[];
};

const resolveValue = (field: SetField, context: Record<string, unknown>) => {
  const rendered = Handlebars.compile(field.valueTemplate ?? "")(context);

  switch (field.type ?? "string") {
    case "number": {
      const value = Number(rendered);
      if (!Number.isFinite(value)) {
        throw new NonRetriableError(
          `SET: Field "${field.key}" must contain a valid number`,
        );
      }
      return value;
    }

    case "boolean": {
      const normalized = rendered.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
      throw new NonRetriableError(
        `SET: Field "${field.key}" must be true or false`,
      );
    }

    case "array": {
      try {
        const value = JSON.parse(rendered);
        if (!Array.isArray(value)) {
          throw new Error("not an array");
        }
        return value;
      } catch {
        throw new NonRetriableError(
          `SET: Field "${field.key}" must contain a valid JSON array`,
        );
      }
    }

    default:
      return rendered;
  }
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
    await step.realtime.publish(
      `node-error-fields-${nodeId}`,
      setChannel.status,
      {
        nodeId,
        status: "error",
      },
    );
    throw new NonRetriableError("SET: No fields configured");
  }

  try {
    const result = await step.run(`set-${nodeId}`, async () => {
      const output: Record<string, unknown[]> = {};

      for (const field of data.fields) {
        const key = field.key?.trim();
        if (!key) continue;

        const value = resolveValue(field, context);

        output[key] = field.type === "array" ? (value as unknown[]) : [value];
      }

      return { ...context, ...output };
    });

    await step.realtime.publish(`node-success-${nodeId}`, setChannel.status, {
      nodeId,
      status: "success",
    });

    return result;
  } catch (error) {
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      setChannel.status,
      {
        nodeId,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    );
    throw error;
  }
};
