"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { HTTPReqDialog, HTTPReqFormValues } from "./dialog";
import { httpTriggerChannel } from "@/inngest/channels/httpTrigger";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";

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

  useNodeStatus({
    nodeId: props.id,
    channel: httpTriggerChannel.name,
    topics: ["status"],
  });

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
