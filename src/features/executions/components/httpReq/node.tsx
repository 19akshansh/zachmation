"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";

import { GlobeIcon } from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { useRealtime } from "inngest/react";

import { BaseExecutionNode } from "../baseExecutionNode";

import { HTTPReqDialog, HTTPReqFormValues } from "./dialog";

import { httpTriggerChannel } from "@/inngest/channels/httpTrigger";

import { NodeStatus } from "@/components/reactFlow/node-status-indicator";

type HTTPReqNodeData = {
  variableName?: string;

  endpoint?: string;

  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  body?: string;

  status?: NodeStatus;
};

type HTTPReqNodeType = Node<HTTPReqNodeData>;

export const HTTPReqNode = (props: NodeProps<HTTPReqNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: HTTPReqFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,

            data: {
              ...node.data,
              ...values,
            },
          };
        }

        return node;
      }),
    );
  };

  const nodeData = props.data;

  const desc = nodeData?.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not configured";

  const refreshToken = useCallback(async () => {
    const res = await fetch("/api/inngest/realtimeToken");

    return res.json();
  }, []);

  const { messages } = useRealtime({
    channel: httpTriggerChannel.name,

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

    if (data.nodeId !== props.id) {
      return;
    }

    // CRITICAL:
    // prevents infinite rerender loops
    if (props.data.status === data.status) {
      return;
    }

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id !== props.id) {
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
  }, [messages.byTopic.status, props.id, props.data.status, setNodes]);

  return (
    <>
      <HTTPReqDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={GlobeIcon}
        name="HTTP Request"
        description={desc}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
};
