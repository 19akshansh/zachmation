import ky from "ky";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { airtableChannel } from "@/inngest/channels/executions/airtable";

type AirtableData = {
  variableName?: string;
  credentialId?: string;
  operation?: "listRecords" | "createRecord" | "updateRecord" | "deleteRecord";
  baseId?: string;
  tableName?: string;
  recordId?: string;
  fields?: string;
};

const resolveJson = (
  value: string,
  context: Record<string, unknown>,
  service: string,
) => {
  try {
    return JSON.parse(Handlebars.compile(value)(context));
  } catch {
    throw new NonRetriableError(
      `${service}: fields must be valid JSON after template resolution`,
    );
  }
};

export const AirtableExecutor: NodeExecutor<AirtableData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    airtableChannel.status,
    { nodeId, status: "loading" },
  );

  if (
    !data.credentialId ||
    !data.operation ||
    !data.baseId ||
    !data.tableName ||
    !data.variableName
  )
    throw new NonRetriableError("AIRTABLE: Missing required configuration");
  try {
    const result = await step.run(`airtable-${nodeId}`, async () => {
      const credential = await prisma.credential.findFirst({
        where: { id: data.credentialId, userId },
      });

      if (!credential)
        throw new NonRetriableError(
          "AIRTABLE: Credential not found or not owned by this user",
        );

      const token = decrypt(credential.value);
      const baseId = Handlebars.compile(data.baseId!)(context);
      const tableName = Handlebars.compile(data.tableName!)(context);
      const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      switch (data.operation) {
        case "listRecords": {
          const response = await ky
            .get(url, { headers })
            .json<{ records: unknown[] }>();
          return { ...context, [data.variableName!]: response.records };
        }
        case "createRecord": {
          if (!data.fields)
            throw new NonRetriableError(
              "AIRTABLE (createRecord): Missing fields",
            );
          const response = await ky
            .post(url, {
              headers,
              json: { fields: resolveJson(data.fields, context, "AIRTABLE") },
            })
            .json();
          return { ...context, [data.variableName!]: [response] };
        }
        case "updateRecord": {
          if (!data.recordId || !data.fields)
            throw new NonRetriableError(
              "AIRTABLE (updateRecord): Missing record id or fields",
            );
          const recordId = Handlebars.compile(data.recordId)(context);
          const response = await ky
            .patch(`${url}/${recordId}`, {
              headers,
              json: { fields: resolveJson(data.fields, context, "AIRTABLE") },
            })
            .json();
          return { ...context, [data.variableName!]: [response] };
        }
        case "deleteRecord": {
          if (!data.recordId)
            throw new NonRetriableError(
              "AIRTABLE (deleteRecord): Missing record id",
            );
          const recordId = Handlebars.compile(data.recordId)(context);
          const response = await ky
            .delete(`${url}/${recordId}`, { headers })
            .json();
          return { ...context, [data.variableName!]: [response] };
        }
        default:
          throw new NonRetriableError("NOTION: Unknown operation");
      }
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      airtableChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      airtableChannel.status,
      { nodeId, status: "error", error: message },
    );

    throw error;
  }
};
