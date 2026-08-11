import Handlebars from "handlebars";
import { CronExpressionParser } from "cron-parser";
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { getReachableSubgraph, topologicalSort } from "./utils";
import { ExecutionStatus, NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/nodes/executionsNodes/lib/executorRegistry";
import { Connection, Node, Prisma } from "@/generated/prisma/client";
import { getSubscriptionStatus } from "@/lib/subscriptions";
import { PRO_NODES } from "@/config/nodeTypes";
import { CHANNELS } from "@/config/channels";
import { withZachCourseStep } from "./steps/zachcourse";
import { sendWorkflowExecution } from "./utils";
import type {
  WorkflowContext,
  WorkflowStepTools,
} from "@/features/nodes/executionsNodes/types";
import { conditionalChannel } from "./channels/executions/conditional";

type ExecutableNode = {
  id: string;
  name: string;
  workflowId: string;
  type: Node["type"];
  position: Node["position"];
  data: Node["data"];
  credentialId: string | null;
  pinnedData: unknown;
};

type ExecutableConnection = {
  id: string;
  workflowId: string;
  fromNodeId: string;
  toNodeId: string;
  fromOutput: string;
  toInput: string;
};

type RunNodeSequenceParams = {
  nodes: ExecutableNode[];
  connections: ExecutableConnection[];
  context: WorkflowContext;
  userId: string;
  executionId: string;
  step: WorkflowStepTools;
  stepScope?: string;
};

const scopedStep = (
  step: WorkflowStepTools,
  scope: string,
): WorkflowStepTools => {
  return new Proxy(step, {
    get(target, property, receiver) {
      if (property === "run") {
        return ((name: string, handler: () => unknown) =>
          target.run(`${scope}:${name}`, handler)) as WorkflowStepTools["run"];
      }

      return Reflect.get(target, property, receiver);
    },
  }) as WorkflowStepTools;
};

const getReachableNodes = (
  startNodeIds: string[],
  connections: ExecutableConnection[],
): Set<string> => {
  const adjacency = new Map<string, string[]>();

  for (const connection of connections) {
    const current = adjacency.get(connection.fromNodeId) || [];
    current.push(connection.toNodeId);
    adjacency.set(connection.fromNodeId, current);
  }

  const reachable = new Set<string>();
  const queue = [...startNodeIds];

  while (queue.length) {
    const nodeId = queue.shift()!;
    if (reachable.has(nodeId)) continue;

    reachable.add(nodeId);

    for (const next of adjacency.get(nodeId) || []) {
      if (!reachable.has(next)) {
        queue.push(next);
      }
    }
  }

  return reachable;
};

type ConditionalData = {
  mode: "if" | "switch";
  leftValue?: string;
  operator?:
    | "equals"
    | "notEquals"
    | "contains"
    | "greaterThan"
    | "lessThan"
    | "isEmpty"
    | "isNotEmpty";
  rightValue?: string;
  switchValue?: string;
  cases?: { label: string; value: string }[];
};

const resolveTemplate = (template: string, context: WorkflowContext) =>
  Handlebars.compile(template ?? "")(context);

const evaluateConditional = (
  data: ConditionalData,
  context: WorkflowContext,
): string => {
  if (data.mode === "switch") {
    const resolved = resolveTemplate(data.switchValue ?? "", context);
    const matched = (data.cases ?? []).find(
      (item) => resolveTemplate(item.value, context) === resolved,
    );
    return matched?.label ?? "default";
  }

  const left = resolveTemplate(data.leftValue ?? "", context);
  const right = resolveTemplate(data.rightValue ?? "", context);

  switch (data.operator) {
    case "equals":
      return left === right ? "true" : "false";
    case "notEquals":
      return left !== right ? "true" : "false";
    case "contains":
      return left.includes(right) ? "true" : "false";
    case "greaterThan":
      return Number(left) > Number(right) ? "true" : "false";
    case "lessThan":
      return Number(left) < Number(right) ? "true" : "false";
    case "isEmpty":
      return left.trim() === "" ? "true" : "false";
    case "isNotEmpty":
      return left.trim() !== "" ? "true" : "false";
    default:
      return "false";
  }
};

const runNodeSequence = async ({
  nodes,
  connections,
  context: initialContext,
  userId,
  executionId,
  step,
  stepScope = "workflow",
}: RunNodeSequenceParams): Promise<WorkflowContext> => {
  let context = initialContext;

  const snapshotContext = async (nodeId: string) => {
    await step.run(`snapshot-${nodeId}`, async () => {
      await prisma.execution.update({
        where: { id: executionId },
        data: {
          lastKnownContext: context as Prisma.InputJsonValue,
        },
      });
    });
  };
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const sortedIds = nodes.map((node) => node.id);
  const outgoing = new Map<string, ExecutableConnection[]>();

  for (const connection of connections) {
    const current = outgoing.get(connection.fromNodeId) || [];
    current.push(connection);
    outgoing.set(connection.fromNodeId, current);
  }

  const skipped = new Set<string>();

  for (const nodeId of sortedIds) {
    if (skipped.has(nodeId)) continue;

    const node = nodeMap.get(nodeId);
    if (!node) continue;

    if (node.type === NodeType.LOOP) {
      const loopData = node.data as {
        sourceKey?: string;
        variableName?: string;
      };

      const sourceKey = loopData.sourceKey?.trim();
      const variableName = loopData.variableName?.trim();

      if (!sourceKey || !variableName) {
        throw new NonRetriableError(
          "LOOP: Source array and result variable are required",
        );
      }

      const source = context[sourceKey];

      if (!Array.isArray(source)) {
        throw new NonRetriableError(
          `LOOP: Context key "${sourceKey}" is not an array`,
        );
      }

      const loopConnections = (outgoing.get(node.id) || []).filter(
        (connection) => connection.fromOutput === "loop",
      );

      const doneConnections = (outgoing.get(node.id) || []).filter(
        (connection) => connection.fromOutput === "done",
      );

      const loopReachable = getReachableNodes(
        loopConnections.map((connection) => connection.toNodeId),
        connections,
      );

      const doneReachable = getReachableNodes(
        doneConnections.map((connection) => connection.toNodeId),
        connections,
      );

      const bodyIds = new Set(
        [...loopReachable].filter(
          (id) => !doneReachable.has(id) && id !== node.id,
        ),
      );

      for (const bodyId of bodyIds) {
        skipped.add(bodyId);
      }

      const bodyNodes = nodes.filter((bodyNode) => bodyIds.has(bodyNode.id));
      const results: unknown[] = [];

      for (let index = 0; index < source.length; index++) {
        const iterationContext: WorkflowContext = {
          ...context,
          $item: [source[index]],
        };

        const iterationResult = await runNodeSequence({
          nodes: bodyNodes,
          connections,
          context: iterationContext,
          userId,
          executionId,
          step: scopedStep(step, `${stepScope}:loop:${node.id}:${index}`),
          stepScope: `${stepScope}:loop:${node.id}:${index}`,
        });

        results.push(iterationResult);
      }

      context = {
        ...context,
        [variableName]: results,
      };

      await snapshotContext(node.id);

      continue;
    }

    if (node.type === NodeType.CONDITIONAL) {
      const conditionalData = node.data as ConditionalData;
      const outputLabels =
        conditionalData.mode === "if"
          ? ["true", "false"]
          : [
              ...(conditionalData.cases ?? []).map((item) => item.label),
              "default",
            ];

      if (
        !["if", "switch"].includes(conditionalData.mode) ||
        outputLabels.length === 0
      ) {
        throw new NonRetriableError("CONDITIONAL: Invalid configuration");
      }

      await step.realtime.publish(
        `node-loading-${node.id}`,
        conditionalChannel.status,
        {
          nodeId: node.id,
          status: "loading",
        },
      );

      try {
        const chosenOutput = evaluateConditional(conditionalData, context);
        const chosenReachable = getReachableSubgraph(
          nodes,
          connections,
          node.id,
          chosenOutput,
        );

        for (const label of outputLabels) {
          if (label === chosenOutput) continue;

          const unchosenReachable = getReachableSubgraph(
            nodes,
            connections,
            node.id,
            label,
          );

          for (const reachableId of unchosenReachable) {
            if (!chosenReachable.has(reachableId)) {
              skipped.add(reachableId);
            }
          }
        }

        await step.realtime.publish(
          `node-success-${node.id}`,
          conditionalChannel.status,
          {
            nodeId: node.id,
            status: "success",
            output: chosenOutput,
          },
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        await step.realtime.publish(
          `node-error-${node.id}`,
          conditionalChannel.status,
          {
            nodeId: node.id,
            status: "error",
            error: message,
          },
        );
        throw error;
      }

      await snapshotContext(node.id);

      continue;
    }

    if (node.pinnedData !== null && node.pinnedData !== undefined) {
      const variableName = (node.data as Record<string, unknown>).variableName;
      if (typeof variableName === "string" && variableName.trim()) {
        context = {
          ...context,
          [variableName.trim()]: node.pinnedData as unknown[],
        };
        await snapshotContext(node.id);
        continue;
      }
    }

    const executor = getExecutor(node.type as NodeType);

    context = await executor({
      data: node.data as Record<string, unknown>,
      nodeId: node.id,
      userId,
      context,
      step,
    });

    await snapshotContext(node.id);
  }

  return context;
};

export const checkScheduledWorkflows = inngest.createFunction(
  {
    id: "checkScheduledWorkflows",
    triggers: {
      cron: "*/5 * * * *",
    },
  },
  async ({ step }) => {
    const cronNodes = await step.run("findCronNodes", async () => {
      return prisma.node.findMany({
        where: {
          type: NodeType.CRON_TRIGGER,
          workflow: { isActive: true },
        },
        select: {
          id: true,
          workflowId: true,
          data: true,
          createdAt: true,
          lastTriggeredAt: true,
        },
      });
    });

    const now = new Date();

    for (const node of cronNodes) {
      const cronExpression = (
        node.data as { cronExpression?: string }
      )?.cronExpression?.trim();

      if (!cronExpression) continue;

      const isDue = await step.run(`checkDue-${node.id}`, async () => {
        try {
          const interval = CronExpressionParser.parse(cronExpression, {
            currentDate: node.lastTriggeredAt ?? node.createdAt,
          });
          const nextRun = interval.next().toDate();
          return nextRun <= now;
        } catch {
          return false;
        }
      });

      if (!isDue) continue;

      await step.run(`trigger-${node.id}`, async () => {
        await sendWorkflowExecution({
          workflowId: node.workflowId,
          initialData: {
            cron: {
              firedAt: now.toISOString(),
            },
          },
        });

        await prisma.node.update({
          where: { id: node.id },
          data: { lastTriggeredAt: now },
        });
      });
    }
  },
);

export const executeWorkflow = inngest.createFunction(
  {
    id: "executeWorkflow",
    triggers: {
      event: "workflows/workflow.exec",
    },
    retries: 0,
    onFailure: async ({ event }) => {
      const failedWorkflowId = event.data.event.data.workflowId as string;

      const execution = await prisma.execution.update({
        where: {
          inngestEventId: event.data.event.id,
        },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });

      const workflow = await prisma.workflow.findUnique({
        where: { id: failedWorkflowId },
        select: { errorWorkflowId: true },
      });

      if (workflow?.errorWorkflowId) {
        await sendWorkflowExecution({
          workflowId: workflow.errorWorkflowId,
          initialData: {
            errorContext: {
              failedWorkflowId,
              error: event.data.error.message,
              executionId: execution.id,
            },
          },
        });
      }

      return execution;
    },
  },

  async ({ event, step }) => {
    const inngestEventId = event.id;

    const data = event.data as {
      workflowId: string;
      initialData?: Record<string, unknown>;
    };

    const workflowId = data.workflowId;

    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError("Event ID or Workflow ID is missing");
    }

    const executionId = await step.run("createExecution", async () => {
      const execution = await prisma.execution.create({
        data: {
          inngestEventId,
          workflowId,
          initialData: (data.initialData ?? {}) as Prisma.InputJsonValue,
        },
        select: {
          id: true,
        },
      });

      return execution.id;
    });

    const preparedWorkflow = await step.run("prepareWorkflow", async () => {
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
        const subscriptionStatus = await getSubscriptionStatus(workflow.userId);

        if (subscriptionStatus === "UNKNOWN") {
          throw new NonRetriableError(
            "Unable to verify subscription status. Please retry later.",
          );
        }

        if (subscriptionStatus !== "PRO") {
          throw new NonRetriableError(
            "This workflow contains PRO nodes and requires an active PRO subscription.",
          );
        }
      }

      const executableWorkflowNodes = workflow.nodes.filter(
        (node) => node.type !== NodeType.STICKY_NOTE,
      );

      const sortedNodes = topologicalSort(
        executableWorkflowNodes,
        workflow.connections,
      );

      const executableNodes: ExecutableNode[] = sortedNodes.map((node) => ({
        id: node.id,
        name: node.name,
        workflowId: node.workflowId,
        type: node.type,
        position: node.position,
        data: node.data,
        credentialId: node.credentialId,
        pinnedData: node.pinnedData,
      }));

      const executableConnections: ExecutableConnection[] =
        workflow.connections.map((connection) => ({
          id: connection.id,
          workflowId: connection.workflowId,
          fromNodeId: connection.fromNodeId,
          toNodeId: connection.toNodeId,
          fromOutput: connection.fromOutput,
          toInput: connection.toInput,
        }));

      return {
        nodes: executableNodes,
        connections: executableConnections,
      };
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

    const rawInitialData = data.initialData || {};

    const context: WorkflowContext = Object.fromEntries(
      Object.entries(rawInitialData).map(([key, value]) => [key, [value]]),
    );

    const workflowStep = withZachCourseStep(step);

    const result = await runNodeSequence({
      nodes: preparedWorkflow.nodes,
      connections: preparedWorkflow.connections,
      context,
      userId,
      executionId,
      step: workflowStep,
    });

    await step.run("updateExecution", async () => {
      return prisma.execution.update({
        where: {
          inngestEventId,
          workflowId,
        },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: result as Prisma.InputJsonValue,
        },
      });
    });

    return {
      workflowId,
      result,
    };
  },
);
