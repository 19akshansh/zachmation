import { useCallback, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useRealtime } from "inngest/react";
import type { ClientSubscriptionToken } from "inngest/react";

import { NodeStatus } from "@/components/reactFlow/node-status-indicator";

interface UseNodeStatusOptions {
  nodeId: string;
  channel: string;
}

export function useNodeStatus({ nodeId, channel }: UseNodeStatusOptions) {
  const { setNodes } = useReactFlow();

  const refreshToken = useCallback(async () => {
    const res = await fetch(`/api/inngest/realtimeToken?channel=${channel}`);

    return res.json() as Promise<ClientSubscriptionToken>;
  }, [channel]);

  const { messages } = useRealtime({
    channel,
    topics: ["status"],
    token: refreshToken,
    bufferInterval: 100,
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

        if (node.data.status === data.status) {
          return node;
        }

        return {
          ...node,
          data: {
            ...node.data,
            status: data.status,
          },
        };
      }),
    );
  }, [messages.byTopic.status, nodeId, setNodes]);
}
