"use client";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { AirtableDialog, AirtableFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type AirtableNodeData = AirtableFormValues & { status?: NodeStatus };
export type AirtableNodeType = Node<AirtableNodeData>;

export const AirtableNode = (props: NodeProps<AirtableNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.AIRTABLE,
    topics: ["status"],
  });

  const handleSubmit = (values: AirtableFormValues) =>
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
      <AirtableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={"/airtable.svg"}
        name="Airtable"
        description={
          variableName
            ? `${props.data.operation || "listRecords"} → ${variableName}`
            : "Airtable records"
        }
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};
AirtableNode.displayName = "Airtable Node";
