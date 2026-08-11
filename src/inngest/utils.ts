import toposort from "toposort";
import { inngest } from "./client";
import { createId } from "@paralleldrive/cuid2";
import prisma from "@/lib/db";

export const topologicalSort = <T extends { id: string }>(
  nodes: T[],
  connections: Array<{
    fromNodeId: string;
    toNodeId: string;
    fromOutput: string;
  }>,
): T[] => {
  if (connections.length === 0) {
    return nodes;
  }

  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    (connectedNodeIds.add(conn.fromNodeId),
      connectedNodeIds.add(conn.toNodeId));
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw error;
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const getReachableSubgraph = (
  nodes: Array<{ id: string }>,
  connections: Array<{
    fromNodeId: string;
    toNodeId: string;
    fromOutput: string;
  }>,
  startNodeId: string,
  outputLabel: string,
): Set<string> => {
  const reachable = new Set<string>();
  const queue = connections
    .filter(
      (connection) =>
        connection.fromNodeId === startNodeId &&
        connection.fromOutput === outputLabel,
    )
    .map((connection) => connection.toNodeId);

  while (queue.length) {
    const nodeId = queue.shift()!;
    if (reachable.has(nodeId)) continue;
    if (!nodes.some((node) => node.id === nodeId)) continue;

    reachable.add(nodeId);

    for (const connection of connections) {
      if (
        connection.fromNodeId === nodeId &&
        !reachable.has(connection.toNodeId)
      ) {
        queue.push(connection.toNodeId);
      }
    }
  }

  return reachable;
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  const workflow = await prisma.workflow.findUnique({
    where: { id: data.workflowId },
    select: { isActive: true },
  });

  if (!workflow) {
    throw new Error(`Workflow ${data.workflowId} not found`);
  }

  if (!workflow.isActive) {
    return { skipped: true, reason: "workflow_inactive" as const };
  }

  return inngest.send({
    name: "workflows/workflow.exec",
    data,
    id: createId(),
  });
};
