"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { DiscordDialog, DiscordFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type DiscordNodeData = {
  webhookUrl?: string;
  content?: string;
  username?: string;
  status?: NodeStatus;
};

export type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = (props: NodeProps<DiscordNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: DiscordFormValues) => {
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
    channel: CHANNELS.DISCORD,
    topics: ["status"],
  });

  return (
    <>
      <DiscordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={{
          webhookUrl: nodeData?.webhookUrl,
          content: nodeData?.content,
          username: nodeData?.username,
        }}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon="/discord.svg"
        name="Discord Node"
        description={"Discord Message Trigger"}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
};

DiscordNode.displayName = "Discord Node";
