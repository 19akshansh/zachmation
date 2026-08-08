import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { NonRetriableError } from "inngest";
import { zachcourseChannel } from "@/inngest/channels/executions/zachcourse";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import ky from "ky";

type ZachCourseData = {
  variableName?: string;
  credentialId?: string;
  baseUrl?: string;
  topic?: string;
  sourceUrl?: string;
  textContent?: string;
  documentContext?: string;
  language?: string;
  experienceLevel?: string;
  backgroundContext?: string;
  weeklyHours?: number;
  tone?: string;
};

export const ZachCourseExecutor: NodeExecutor<ZachCourseData> = async ({
  data, nodeId, userId, context, step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, zachcourseChannel.status, {
    nodeId, status: "loading",
  });

  if (!data.credentialId || !data.variableName || !data.baseUrl || !data.topic) {
    throw new NonRetriableError(
      "ZACHCOURSE: Missing credential, variable name, base URL, or topic",
    );
  }

  const compile = (value?: string) =>
    value ? Handlebars.compile(value)(context) : undefined;

  const topic = compile(data.topic);
  const sourceUrl = compile(data.sourceUrl);
  const textContent = compile(data.textContent);
  const documentContext = compile(data.documentContext);
  const language = compile(data.language) || "en";
  const experienceLevel = compile(data.experienceLevel) || "beginner";
  const backgroundContext = compile(data.backgroundContext) || "";
  const tone = compile(data.tone) || "friendly";

  try {
    const result = await step.run(`zachcourse-${nodeId}`, async () => {
      const credential = await prisma.credential.findFirst({
        where: { id: data.credentialId, userId, type: "ZACHCOURSE" },
      });

      if (!credential) {
        throw new NonRetriableError(
          "ZACHCOURSE: Credential not found or not owned by this user",
        );
      }

      const apiKey = decrypt(credential.value);
      const baseUrl = data.baseUrl!.replace(/\/$/, "");

      const response = await ky
        .post(`${baseUrl}/api/v1/courses/generate`, {
          headers: { "x-api-key": apiKey },
          json: {
            topic,
            ...(sourceUrl ? { sourceUrl } : {}),
            ...(textContent ? { textContent } : {}),
            ...(documentContext ? { documentContext } : {}),
            language,
            experienceLevel,
            backgroundContext,
            weeklyHours: data.weeklyHours ?? 5,
            tone,
          },
        })
        .json<{ course: unknown }>();

      return { ...context, [data.variableName!]: response.course };
    });

    await step.realtime.publish(`node-success-${nodeId}`, zachcourseChannel.status, {
      nodeId, status: "success",
    });
    return result;
  } catch (error) {
    await step.realtime.publish(`node-error-${nodeId}`, zachcourseChannel.status, {
      nodeId,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};
