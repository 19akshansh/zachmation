import { Client as NotionClient } from "@notionhq/client";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { notionChannel } from "@/inngest/channels/executions/notion";

type NotionData = {
  variableName?: string;
  credentialId?: string;
  operation?: "queryDatabase" | "createPage" | "updatePage";
  databaseId?: string;
  pageId?: string;
  properties?: string;
};

const resolveJson = (value: string, context: Record<string, unknown>) => {
  try {
    return JSON.parse(Handlebars.compile(value)(context));
  } catch {
    throw new NonRetriableError(
      "NOTION: properties must be valid JSON after template resolution",
    );
  }
};

export const NotionExecutor: NodeExecutor<NotionData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, notionChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.credentialId || !data.operation || !data.variableName)
    throw new NonRetriableError(
      "NOTION: Missing credential, operation, or variable name",
    );

  try {
    const result = await step.run(`notion-${nodeId}`, async () => {
      const credential = await prisma.credential.findFirst({
        where: { id: data.credentialId, userId },
      });

      if (!credential)
        throw new NonRetriableError(
          "NOTION: Credential not found or not owned by this user",
        );

      const notion = new NotionClient({ auth: decrypt(credential.value) });

      switch (data.operation) {
        case "queryDatabase": {
          if (!data.databaseId)
            throw new NonRetriableError(
              "NOTION (queryDatabase): Missing database id",
            );

          const databaseId = Handlebars.compile(data.databaseId)(context);
          const response = await notion.dataSources.query({
            data_source_id: databaseId,
          });

          return { ...context, [data.variableName!]: response.results };
        }
        case "createPage": {
          if (!data.databaseId || !data.properties)
            throw new NonRetriableError(
              "NOTION (createPage): Missing database id or properties",
            );

          const databaseId = Handlebars.compile(data.databaseId)(context);
          const properties = resolveJson(data.properties, context);
          const page = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: properties as never,
          });

          return { ...context, [data.variableName!]: [page] };
        }
        case "updatePage": {
          if (!data.pageId || !data.properties)
            throw new NonRetriableError(
              "NOTION (updatePage): Missing page id or properties",
            );

          const pageId = Handlebars.compile(data.pageId)(context);
          const properties = resolveJson(data.properties, context);
          const page = await notion.pages.update({
            page_id: pageId,
            properties: properties as never,
          });

          return { ...context, [data.variableName!]: [page] };
        }
        default:
          throw new NonRetriableError("NOTION: Unknown operation");
      }
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      notionChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      notionChannel.status,
      { nodeId, status: "error", error: message },
    );

    throw error;
  }
};
