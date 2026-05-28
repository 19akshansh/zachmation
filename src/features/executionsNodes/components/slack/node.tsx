"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { SlackDialog, SlackFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type SlackNodeData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  status?: NodeStatus;
};

export type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = (props: NodeProps<SlackNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: SlackFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id !== props.id) {
          return node;
        }
        return {
          ...node,
          data: {
            ...node.data,
            ...values,
          },
        };
      }),
    );
  };

  const nodeData = props.data;

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.SLACK,
    topics: ["status"],
  });

  return (
    <>
      <SlackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={{
          webhookUrl: nodeData?.webhookUrl,
          content: nodeData?.content,
          variableName: nodeData?.variableName,
        }}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon="/slack.svg"
        name="Slack Node"
        description={"Slack Message Trigger"}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
};

SlackNode.displayName = "Slack Node";
