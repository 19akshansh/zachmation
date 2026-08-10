"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BrainCircuitIcon } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";
import { VectorStoreDialog, VectorStoreFormValues } from "./dialog";

export type VectorStoreNodeData = VectorStoreFormValues & {
  status?: NodeStatus;
};

export type VectorStoreNodeType = Node<VectorStoreNodeData>;

export const VectorStoreNode = (props: NodeProps<VectorStoreNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.VECTOR_STORE,
    topics: ["status"],
  });

  const handleSubmit = (values: VectorStoreFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const operation = props.data.operation === "search" ? "Search" : "Store";
  const variableName =
    typeof props.data.variableName === "string"
      ? props.data.variableName.trim()
      : "";

  return (
    <>
      <VectorStoreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data as Partial<VectorStoreFormValues>}
      />

      <BaseExecutionNode
        {...props}
        icon={BrainCircuitIcon}
        name="Vector Store"
        description={
          variableName
            ? `${operation} → ${variableName}`
            : "Store or search workflow memory"
        }
        status={props.data.status || "initial"}
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};

VectorStoreNode.displayName = "Vector Store Node";
