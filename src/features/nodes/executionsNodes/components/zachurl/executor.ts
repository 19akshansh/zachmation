import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { NonRetriableError } from "inngest";
import { zachurlChannel } from "@/inngest/channels/executions/zachurl";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import ky from "ky";

type ZachurlData = {
  variableName?: string;
  credentialId?: string;
  originalUrl?: string;
  customSlug?: string;
};

export const ZachurlExecutor: NodeExecutor<ZachurlData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, zachurlChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.credentialId || !data.variableName || !data.originalUrl) {
    throw new NonRetriableError(
      "ZACHURL: Missing credential, variable name, or original URL",
    );
  }

  const originalUrl = Handlebars.compile(data.originalUrl)(context);
  const customSlug = data.customSlug
    ? Handlebars.compile(data.customSlug)(context).trim()
    : undefined;

  try {
    const result = await step.run(`zachurl-${nodeId}`, async () => {
      const credential = await prisma.credential.findFirst({
        where: { id: data.credentialId, userId, type: "ZACHURL" },
      });

      if (!credential) {
        throw new NonRetriableError(
          "ZACHURL: Credential not found or not owned by this user",
        );
      }

      const apiKey = decrypt(credential.value);
      const baseUrl = "https://zachurl.vercel.app";

      const response = await ky
        .post(`${baseUrl}/api/v1/urls`, {
          headers: { "x-api-key": apiKey },
          json: {
            originalUrl,
            ...(customSlug ? { customSlug } : {}),
          },
        })
        .json<unknown>();

      return {
        ...context,
        [data.variableName!]: [response],
      };
    });

    await step.realtime.publish(`node-success-${nodeId}`, zachurlChannel.status, {
      nodeId,
      status: "success",
    });
    return result;
  } catch (error) {
    await step.realtime.publish(`node-error-${nodeId}`, zachurlChannel.status, {
      nodeId,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};
