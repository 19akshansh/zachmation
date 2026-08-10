import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { vectorStoreChannel } from "@/inngest/channels/executions/vectorStore";
import {
  searchMemory,
  storeMemory,
} from "@/lib/vectorMemory";

type VectorStoreData = {
  variableName?: string;
  credentialId?: string;
  operation?: "store" | "search";
  namespace?: string;
  content?: string;
  query?: string;
  limit?: number;
};

export const VectorStoreExecutor: NodeExecutor<VectorStoreData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `node-loading-${nodeId}`,
    vectorStoreChannel.status,
    { nodeId, status: "loading" },
  );

  if (!data.operation || !data.namespace || !data.variableName || !data.credentialId) {
    await step.realtime.publish(
      `node-error-config-${nodeId}`,
      vectorStoreChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError(
      "VECTOR_STORE: Missing operation, namespace, credential, or result variable",
    );
  }

  const variableName = data.variableName

  try {
    const result = await step.run(`vector-store-${nodeId}`, async () => {
      const credential = await prisma.credential.findFirst({
        where: {
          id: data.credentialId,
          userId,
          type: "GEMINI",
        },
      });

      if (!credential) {
        throw new NonRetriableError(
          "VECTOR_STORE: Gemini credential not found or not owned by this user",
        );
      }

      const geminiApiKey = decrypt(credential.value);
      const namespace = Handlebars.compile(data.namespace)(context);

      if (!namespace.trim()) {
        throw new NonRetriableError(
          "VECTOR_STORE: Namespace cannot be empty",
        );
      }

      if (data.operation === "store") {
        if (!data.content?.trim()) {
          throw new NonRetriableError(
            "VECTOR_STORE (store): Missing content",
          );
        }

        const content = Handlebars.compile(data.content)(context);
        if (!content.trim()) {
          throw new NonRetriableError(
            "VECTOR_STORE (store): Resolved content is empty",
          );
        }

        const chunksStored = await storeMemory({
          userId,
          namespace,
          content,
          geminiApiKey,
        });

        return {
          ...context,
          [variableName]: [{ chunksStored }],
        };
      }

      if (!data.query?.trim()) {
        throw new NonRetriableError(
          "VECTOR_STORE (search): Missing query",
        );
      }

      const query = Handlebars.compile(data.query)(context);
      if (!query.trim()) {
        throw new NonRetriableError(
          "VECTOR_STORE (search): Resolved query is empty",
        );
      }

      const matches = await searchMemory({
        userId,
        namespace,
        query,
        limit: Math.min(Math.max(data.limit ?? 5, 1), 20),
        geminiApiKey,
      });

      return {
        ...context,
        [variableName]: matches,
      };
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      vectorStoreChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      vectorStoreChannel.status,
      { nodeId, status: "error", error: message },
    );

    throw error;
  }
};
