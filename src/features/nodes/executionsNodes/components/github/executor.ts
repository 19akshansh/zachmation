import { Octokit } from "octokit";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import type { NodeExecutor } from "@/features/nodes/executionsNodes/types";
import { githubChannel } from "@/inngest/channels/executions/github";

type GitHubData = {
  variableName?: string;
  credentialId?: string;
  operation?: "createIssue" | "listIssues" | "createComment" | "closeIssue";
  owner?: string;
  repo?: string;
  issueNumber?: string;
  title?: string;
  body?: string;
  state?: string;
};

export const GitHubExecutor: NodeExecutor<GitHubData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
}) => {
  await step.realtime.publish(`node-loading-${nodeId}`, githubChannel.status, {
    nodeId,
    status: "loading",
  });

  if (
    !data.credentialId ||
    !data.operation ||
    !data.owner ||
    !data.repo ||
    !data.variableName
  )
    throw new NonRetriableError("GITHUB: Missing required configuration");
  try {
    const result = await step.run(`github-${nodeId}`, async () => {
      const credential = await prisma.credential.findFirst({
        where: { id: data.credentialId, userId },
      });

      if (!credential)
        throw new NonRetriableError(
          "GITHUB: Credential not found or not owned by this user",
        );

      const octokit = new Octokit({ auth: decrypt(credential.value) });
      const owner = Handlebars.compile(data.owner!)(context);
      const repo = Handlebars.compile(data.repo!)(context);

      switch (data.operation) {
        case "createIssue": {
          if (!data.title)
            throw new NonRetriableError("GITHUB (createIssue): Missing title");

          const title = Handlebars.compile(data.title)(context);

          const body = data.body
            ? Handlebars.compile(data.body)(context)
            : undefined;

          const { data: issue } = await octokit.rest.issues.create({
            owner,
            repo,
            title,
            body,
          });

          return { ...context, [data.variableName!]: [issue] };
        }
        case "listIssues": {
          const { data: issues } = await octokit.rest.issues.listForRepo({
            owner,
            repo,
            state: (data.state as "open" | "closed" | "all") ?? "open",
          });

          return { ...context, [data.variableName!]: issues };
        }
        case "createComment": {
          if (!data.issueNumber || !data.body)
            throw new NonRetriableError(
              "GITHUB (createComment): Missing issue number or body",
            );

          const issueNumber = Number(
            Handlebars.compile(data.issueNumber)(context),
          );

          if (!Number.isInteger(issueNumber) || issueNumber < 1)
            throw new NonRetriableError(
              "GITHUB (createComment): Invalid issue number",
            );

          const body = Handlebars.compile(data.body)(context);
          const { data: comment } = await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body,
          });

          return { ...context, [data.variableName!]: [comment] };
        }
        case "closeIssue": {
          if (!data.issueNumber)
            throw new NonRetriableError(
              "GITHUB (closeIssue): Missing issue number",
            );

          const issueNumber = Number(
            Handlebars.compile(data.issueNumber)(context),
          );

          if (!Number.isInteger(issueNumber) || issueNumber < 1)
            throw new NonRetriableError(
              "GITHUB (closeIssue): Invalid issue number",
            );

          const { data: issue } = await octokit.rest.issues.update({
            owner,
            repo,
            issue_number: issueNumber,
            state: "closed",
          });

          return { ...context, [data.variableName!]: [issue] };
        }
        default:
          throw new NonRetriableError("NOTION: Unknown operation");
      }
    });

    await step.realtime.publish(
      `node-success-${nodeId}`,
      githubChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await step.realtime.publish(
      `node-error-runtime-${nodeId}`,
      githubChannel.status,
      { nodeId, status: "error", error: message },
    );

    throw error;
  }
};
