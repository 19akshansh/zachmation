import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/lib/executorRegistry";

export const executeWorkflow = inngest.createFunction(
  {
    id: "executeWorkflow",
    triggers: {
      event: "workflows/workflow.exec",
    },
    retries: 0,
  },

  async ({ event, step }) => {
    const data = event.data as {
      workflowId: string;
      initialData?: Record<string, unknown>;
    };

    const workflowId = data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    const sortedNodes = await step.run(
      "prepareWorkflow",

      async () => {
        const workflow = await prisma.workflow.findUniqueOrThrow({
          where: {
            id: workflowId,
          },

          include: {
            nodes: true,
            connections: true,
          },
        });

        return topologicalSort(workflow.nodes, workflow.connections);
      },
    );

    const userId = await step.run("getUserId", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },

        select: {
          userId: true,
        },
      });

      return workflow.userId;
    });

    let context = data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);

      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
        context,
        step,
      });
    }

    return {
      workflowId,
      result: context,
    };
  },
);
