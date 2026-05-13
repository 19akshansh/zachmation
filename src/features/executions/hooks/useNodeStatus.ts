import { useEffect } from "react";

import { useRealtime } from "inngest/react";
import type { ClientSubscriptionToken } from "inngest/react";

import { useReactFlow } from "@xyflow/react";

import { NodeStatus } from "@/components/reactFlow/node-status-indicator";

interface UseNodeStatusOptions {
  nodeId: string;
  channel: string;
  topics: string[];
  refreshToken: () => Promise<ClientSubscriptionToken>;
}

export function useNodeStatus({
  nodeId,
  channel,
  topics,
  refreshToken,
}: UseNodeStatusOptions) {
  const { setNodes } = useReactFlow();

  const { messages } = useRealtime({
    channel,
    topics,
    token: refreshToken,
  });

  useEffect(() => {
    const message = messages.byTopic.status;

    if (!message || message.kind !== "data") {
      return;
    }

    const data = message.data as {
      nodeId: string;
      status: NodeStatus;
    };

    if (data.nodeId !== nodeId) {
      return;
    }

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        return {
          ...node,
          data: {
            ...node.data,
            realtimeStatus: data.status,
          },
        };
      }),
    );
  }, [messages.byTopic, nodeId, setNodes]);
}
