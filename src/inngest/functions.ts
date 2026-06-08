import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { ExecutionStatus, NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/nodes/executionsNodes/lib/executorRegistry";
import { Prisma } from "@/generated/prisma/client";
import { hasProSubscription } from "@/lib/subscriptions";
import { PRO_NODES } from "@/config/proNodes";

export const executeWorkflow = inngest.createFunction(
  {
    id: "executeWorkflow",
    triggers: {
      event: "workflows/workflow.exec",
    },
    retries: 0,
    onFailure: async ({ event, step }) => {
      return prisma.execution.update({
        where: {
          inngestEventId: event.data.event.id,
        },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
  },

  async ({ event, step }) => {
    const inngestEventId = event.id;
    const data = event.data as {
      workflowId: string;
      initialData?: Record<string, unknown>;
    };

    const workflowId = data.workflowId;

    if (!inngestEventId || !data.workflowId) {
      throw new NonRetriableError("Event ID or Workflow ID is missing");
    }

    await step.run("createExecution", async () => {
      return prisma.execution.create({
        data: {
          inngestEventId,
          workflowId,
        },
      });
    });

   const sortedNodes = await step.run("prepareWorkflow", async () => {
     const workflow = await prisma.workflow.findUniqueOrThrow({
       where: {
         id: workflowId,
       },
       include: {
         nodes: true,
         connections: true,
       },
     });

     const containsProNodes = workflow.nodes.some((node) =>
       PRO_NODES.has(node.type),
     );

     if (containsProNodes) {
       const hasPro = await hasProSubscription(workflow.userId);

       if (!hasPro) {
         throw new NonRetriableError(
           "This workflow contains PRO nodes and requires an active PRO subscription.",
         );
       }
     }

     return topologicalSort(workflow.nodes, workflow.connections);
   });

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

    await step.run("updateExecution", async () => {
      return prisma.execution.update({
        where: {
          inngestEventId,
          workflowId,
        },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context as Prisma.InputJsonValue,
        },
      });
    });

    return {
      workflowId,
      result: context,
    };
  },
);
