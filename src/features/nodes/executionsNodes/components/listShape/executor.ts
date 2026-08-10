import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { listShapeChannel } from "@/inngest/channels/executions/listShape";

type ListShapeData = {
  mode?: "sort" | "removeDuplicates" | "aggregate";
  sourceKey?: string;
  variableName?: string;
  fieldPath?: string;
  sortDirection?: "asc" | "desc";
  aggregateFieldName?: string;
};

const getPath = (obj: unknown, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    );

export const ListShapeExecutor: NodeExecutor<ListShapeData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    listShapeChannel.status,
    { nodeId, status: "loading" },
  );

  if (!data.mode || !data.sourceKey || !data.variableName) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      listShapeChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      "LIST_SHAPE: Missing mode, source key, or variable name",
    );
  }

  const source = context[data.sourceKey];
  if (!Array.isArray(source)) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      listShapeChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      `LIST_SHAPE: Context key "${data.sourceKey}" is not an array`,
    );
  }

  try {
    const result = await step.run(`list-shape-${nodeId}`, async () => {
      if (data.mode === "sort") {
        if (!data.fieldPath) {
          throw new NonRetriableError(
            "LIST_SHAPE (sort): Missing field path",
          );
        }

        const sorted = [...source].sort((a, b) => {
          const aValue = getPath(a, data.fieldPath!);
          const bValue = getPath(b, data.fieldPath!);

          if (aValue === bValue) return 0;

          const comparison = (aValue as any) > (bValue as any) ? 1 : -1;
          return data.sortDirection === "desc" ? -comparison : comparison;
        });

        return { ...context, [data.variableName!]: sorted };
      }

      if (data.mode === "removeDuplicates") {
        if (!data.fieldPath) {
          throw new NonRetriableError(
            "LIST_SHAPE (removeDuplicates): Missing field path",
          );
        }

        const seen = new Set<unknown>();
        const deduped = source.filter((item) => {
          const key = getPath(item, data.fieldPath!);

          if (seen.has(key)) return false;

          seen.add(key);
          return true;
        });

        return { ...context, [data.variableName!]: deduped };
      }

      if (!data.fieldPath || !data.aggregateFieldName) {
        throw new NonRetriableError(
          "LIST_SHAPE (aggregate): Missing field path or output field name",
        );
      }

      const packed = source.map((item) => getPath(item, data.fieldPath!));

      return {
        ...context,
        [data.variableName!]: [
          { [data.aggregateFieldName]: packed },
        ],
      };
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      listShapeChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      listShapeChannel.status,
      { nodeId, status: "error", error: message },
    );

    throw error;
  }
};
