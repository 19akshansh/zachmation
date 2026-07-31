"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { PencilLineIcon } from "lucide-react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { SetDialog, SetFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type SetNodeData = {
  fields?: SetFormValues["fields"];
  status?: NodeStatus;
};

export type SetNodeType = Node<SetNodeData>;

export const SetNode = (props: NodeProps<SetNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: SetFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.SET,
    topics: ["status"],
  });

  const fieldCount = props.data.fields?.length ?? 0;

  return (
    <>
      <SetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={{ fields: props.data.fields }}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={PencilLineIcon}
        name="Edit Fields"
        description={
          fieldCount > 0
            ? `${fieldCount} field${fieldCount === 1 ? "" : "s"} configured`
            : "Reshape workflow context"
        }
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
};

SetNode.displayName = "Edit Fields Node";
