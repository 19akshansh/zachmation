import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type {
  NodeExecutor,
  WorkflowContext,
} from "@/features/nodes/executionsNodes/types";
import { filterChannel } from "@/inngest/channels/executions/filter";

type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "greaterThan"
  | "lessThan"
  | "isEmpty"
  | "isNotEmpty";

type FilterData = {
  sourceKey?: string;
  variableName?: string;
  leftValue?: string;
  operator?: FilterOperator;
  rightValue?: string;
};

const evaluateItemCondition = (
  data: FilterData,
  item: unknown,
  context: WorkflowContext,
): boolean => {
  const itemContext = { ...context, $item: [item] };
  const left = Handlebars.compile(data.leftValue ?? "")(itemContext);
  const right = Handlebars.compile(data.rightValue ?? "")(itemContext);

  switch (data.operator) {
    case "equals":
      return left === right;
    case "notEquals":
      return left !== right;
    case "contains":
      return left.includes(right);
    case "greaterThan":
      return Number(left) > Number(right);
    case "lessThan":
      return Number(left) < Number(right);
    case "isEmpty":
      return left.trim() === "";
    case "isNotEmpty":
      return left.trim() !== "";
    default:
      return false;
  }
};

export const FilterExecutor: NodeExecutor<FilterData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, filterChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.sourceKey || !data.variableName || !data.operator) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      filterChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      "FILTER: Missing source key, variable name, or operator",
    );
  }

  const source = context[data.sourceKey];
  if (!Array.isArray(source)) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      filterChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      `FILTER: Context key "${data.sourceKey}" is not an array`,
    );
  }

  try {
    const result = await step.run(`filter-${nodeId}`, async () => {
      const kept = source.filter((item) =>
        evaluateItemCondition(data, item, context),
      );

      return {
        output: { ...context, [data.variableName!]: kept },
        keptCount: kept.length,
      };
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      filterChannel.status,
      {
        nodeId,
        status: "success",
        keptCount: result.keptCount,
      },
    );

    return result.output;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      filterChannel.status,
      { nodeId, status: "error", error: message },
    );
    throw error;
  }
};
