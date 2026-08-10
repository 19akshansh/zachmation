"use client";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { NotionDialog, NotionFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type NotionNodeData = NotionFormValues & { status?: NodeStatus };
export type NotionNodeType = Node<NotionNodeData>;

export const NotionNode = (props: NodeProps<NotionNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.NOTION,
    topics: ["status"],
  });

  const handleSubmit = (values: NotionFormValues) =>
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );

  const variableName = props.data.variableName?.trim();

  return (
    <>
      <NotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={"/notion.svg"}
        name="Notion"
        description={
          variableName
            ? `${props.data.operation || "queryDatabase"} → ${variableName}`
            : "Notion database"
        }
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};
NotionNode.displayName = "Notion Node";
