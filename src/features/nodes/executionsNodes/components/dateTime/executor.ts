import {
  addDays,
  addHours,
  addMinutes,
  format,
  parseISO,
  subDays,
  subHours,
  subMinutes,
} from "date-fns";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type {
  NodeExecutor,
  WorkflowContext,
} from "@/features/nodes/executionsNodes/types";
import { dateTimeChannel } from "@/inngest/channels/executions/dateTime";

type DateTimeOperation =
  | "format"
  | "addDays"
  | "addHours"
  | "addMinutes"
  | "subtractDays"
  | "subtractHours"
  | "subtractMinutes";

type DateTimeData = {
  sourceKey?: string;
  variableName?: string;
  dateValueTemplate?: string;
  operation?: DateTimeOperation;
  formatPattern?: string;
  amount?: number;
};

const applyOperation = (date: Date, data: DateTimeData): string | Date => {
  switch (data.operation) {
    case "format":
      return format(date, data.formatPattern ?? "yyyy-MM-dd");
    case "addDays":
      return addDays(date, data.amount ?? 0);
    case "addHours":
      return addHours(date, data.amount ?? 0);
    case "addMinutes":
      return addMinutes(date, data.amount ?? 0);
    case "subtractDays":
      return subDays(date, data.amount ?? 0);
    case "subtractHours":
      return subHours(date, data.amount ?? 0);
    case "subtractMinutes":
      return subMinutes(date, data.amount ?? 0);
    default:
      throw new NonRetriableError("DATE_TIME: Unknown operation");
  }
};

export const DateTimeExecutor: NodeExecutor<DateTimeData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    dateTimeChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  if (
    !data.sourceKey ||
    !data.variableName ||
    !data.dateValueTemplate ||
    !data.operation
  ) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      dateTimeChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      "DATE_TIME: Missing source key, variable name, date template, or operation",
    );
  }

  if (data.operation === "format" && !data.formatPattern?.trim()) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      dateTimeChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError("DATE_TIME: Format pattern is required");
  }

  const source = context[data.sourceKey];
  if (!Array.isArray(source)) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      dateTimeChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      `DATE_TIME: Context key "${data.sourceKey}" is not an array`,
    );
  }

  try {
    const result = await step.run(`date-time-${nodeId}`, async () => {
      const processed = source.map((item) => {
        const itemContext: WorkflowContext = {
          ...context,
          $item: [item],
        };
        const resolvedDateString = Handlebars.compile(data.dateValueTemplate!)(
          itemContext,
        );
        const parsed = parseISO(resolvedDateString);

        if (Number.isNaN(parsed.getTime())) {
          throw new NonRetriableError(
            `DATE_TIME: "${resolvedDateString}" is not a valid ISO date`,
          );
        }

        return applyOperation(parsed, data);
      });

      return {
        ...context,
        [data.variableName!]: processed,
      };
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      dateTimeChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      dateTimeChannel.status,
      { nodeId, status: "error", error: message },
    );

    throw error;
  }
};
