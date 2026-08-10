"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { ListTreeIcon } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { ListShapeDialog, ListShapeFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type ListShapeNodeData = ListShapeFormValues & {
  status?: NodeStatus;
};

export type ListShapeNodeType = Node<ListShapeNodeData>;

export const ListShapeNode = (props: NodeProps<ListShapeNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.LIST_SHAPE,
    topics: ["status"],
  });

  const handleSubmit = (values: ListShapeFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const handleOpenSettings = () => setDialogOpen(true);

  const sourceKey = props.data.sourceKey?.trim();
  const variableName = props.data.variableName?.trim();

  const modeLabel =
    props.data.mode === "removeDuplicates"
      ? "Remove duplicates"
      : props.data.mode === "aggregate"
        ? "Aggregate"
        : "Sort";

  return (
    <>
      <ListShapeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={ListTreeIcon}
        name="List Shape"
        description={
          sourceKey
            ? `${modeLabel}: ${sourceKey}${variableName ? ` → ${variableName}` : ""}`
            : "Sort, aggregate, or deduplicate an array"
        }
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
};

ListShapeNode.displayName = "List Shape Node";
