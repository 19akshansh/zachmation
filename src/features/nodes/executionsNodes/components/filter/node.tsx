"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { ListFilterIcon } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { FilterDialog, FilterFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type FilterNodeData = FilterFormValues & { status?: NodeStatus };
export type FilterNodeType = Node<FilterNodeData>;

export const FilterNode = (props: NodeProps<FilterNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.FILTER,
    topics: ["status"],
  });

  const handleSubmit = (values: FilterFormValues) => {
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
  return (
    <>
      <FilterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={ListFilterIcon}
        name="Filter"
        description={
          sourceKey
            ? `Filter ${sourceKey}${variableName ? ` → ${variableName}` : ""}`
            : "Filter an array"
        }
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
};

FilterNode.displayName = "Filter Node";
