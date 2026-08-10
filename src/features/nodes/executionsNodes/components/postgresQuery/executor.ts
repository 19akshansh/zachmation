import { Pool } from "pg";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { postgresQueryChannel } from "@/inngest/channels/executions/postgresQuery";

type PostgresQueryData = {
  variableName?: string;
  credentialId?: string;
  query?: string;
  parameters?: string;
};

const isSupportedQuery = (query: string) =>
  /^(select|insert)\b/i.test(query.trim());

const resolveParameters = (
  templates: string,
  context: Record<string, unknown>,
) =>
  templates
    .split(",")
    .map((template) => template.trim())
    .filter(Boolean)
    .map((template) => Handlebars.compile(template)(context));

export const PostgresQueryExecutor: NodeExecutor<PostgresQueryData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    postgresQueryChannel.status,
    { nodeId, status: "loading" },
  );

  const query = data.query?.trim();

  if (!data.credentialId || !query || !data.variableName) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      postgresQueryChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      "POSTGRES_QUERY: Missing credential, query, or variable name",
    );
  }

  if (!isSupportedQuery(query)) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      postgresQueryChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      "POSTGRES_QUERY: Only SELECT and INSERT queries are supported",
    );
  }

  try {
    const result = await step.run(`postgres-query-${nodeId}`, async () => {
      const credential = await prisma.credential.findFirst({
        where: {
          id: data.credentialId,
          userId,
          type: "POSTGRES",
        },
      });

      if (!credential) {
        throw new NonRetriableError(
          "POSTGRES_QUERY: Credential not found or not owned by this user",
        );
      }

      const connectionString = decrypt(credential.value).trim();
      if (!connectionString) {
        throw new NonRetriableError(
          "POSTGRES_QUERY: Postgres connection string is empty",
        );
      }

      const resolvedParams = resolveParameters(data.parameters ?? "", context);
      const pool = new Pool({
        connectionString,
        max: 1,
        connectionTimeoutMillis: 10_000,
        idleTimeoutMillis: 10_000,
        statement_timeout: 15_000,
      });

      try {
        const queryResult = await pool.query({
          text: query,
          values: resolvedParams,
        });

        return {
          ...context,
          [data.variableName!]: queryResult.rows,
        };
      } finally {
        await pool.end();
      }
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      postgresQueryChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      postgresQueryChannel.status,
      { nodeId, status: "error", error: message },
    );
    throw error;
  }
};
