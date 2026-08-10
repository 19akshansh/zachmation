"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BotIcon } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";
import { AgentDialog, AgentFormValues } from "./dialog";

export type AgentNodeData = AgentFormValues & {
  status?: NodeStatus;
};

export type AgentNodeType = Node<AgentNodeData>;

export const AgentNode = (props: NodeProps<AgentNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.AGENT,
    topics: ["status"],
  });

  const handleSubmit = (values: AgentFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const variableName =
    typeof props.data.variableName === "string"
      ? props.data.variableName.trim()
      : "";
  const memory = props.data.memoryNamespace?.trim();

  return (
    <>
      <AgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        icon={BotIcon}
        name="Agent"
        description={
          variableName
            ? `${memory ? "Memory • " : ""}${variableName}`
            : "AI agent with web and optional memory tools"
        }
        status={props.data.status || "initial"}
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};

AgentNode.displayName = "Agent Node";
