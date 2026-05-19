import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import { httpTriggerChannel } from "@/inngest/channels/httpTrigger";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);

  return new Handlebars.SafeString(stringified);
});

type HTTPReqTriggerData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const HTTPReqTriggerExecutor: NodeExecutor<HTTPReqTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    httpTriggerChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  try {
    if (!data.endpoint) {
      await step.realtime.publish(
        `node-error-endpoint-${nodeId}`,

        httpTriggerChannel.status,

        {
          nodeId,
          status: "error",
        },
      );

      throw new NonRetriableError("HTTP Request node: No endpoint configured");
    }

    if (!data.variableName) {
      await step.realtime.publish(
        `node-error-variable-${nodeId}`,

        httpTriggerChannel.status,

        {
          nodeId,
          status: "error",
        },
      );

      throw new NonRetriableError("No variable name configured");
    }

    if (!data.method) {
      await step.realtime.publish(
        `node-error-method-${nodeId}`,

        httpTriggerChannel.status,

        {
          nodeId,
          status: "error",
        },
      );

      throw new NonRetriableError("HTTP Request node: No Method configured");
    }

    const result = await step.run(
      `httpTrigger-${nodeId}`,

      async () => {
        const endpoint = Handlebars.compile(data.endpoint)(context);

        const method = data.method || "GET";

        const options: KyOptions = {
          method,
        };

        if (["POST", "PUT", "PATCH"].includes(method)) {
          const resolved = Handlebars.compile(data.body || "{}")(context);

          JSON.parse(resolved);

          options.body = resolved;

          options.headers = {
            "Content-Type": "application/json",
          };
        }

        const response = await ky(endpoint, options);

        const contentType = response.headers.get("content-type");

        const responseData = contentType?.includes("application/json")
          ? await response.json()
          : await response.text();

        const responsePayload = {
          httpResponse: {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          },
        };

        return {
          ...context,
          [data.variableName]: responsePayload,
        };
      },
    );

    await step.realtime.publish(
      `node-success-${nodeId}`,

      httpTriggerChannel.status,

      {
        nodeId,
        status: "success",
      },
    );

    return result;
  } catch (error) {
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,

      httpTriggerChannel.status,

      {
        nodeId,
        status: "error",
      },
    );

    throw error;
  }
};
