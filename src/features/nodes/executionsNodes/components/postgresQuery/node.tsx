"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { PostgresQueryDialog, PostgresQueryFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type PostgresQueryNodeData = PostgresQueryFormValues & {
  status?: NodeStatus;
};
export type PostgresQueryNodeType = Node<PostgresQueryNodeData>;

export const PostgresQueryNode = (props: NodeProps<PostgresQueryNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.POSTGRES_QUERY,
    topics: ["status"],
  });

  const handleSubmit = (values: PostgresQueryFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const variableName = props.data.variableName?.trim();
  const operation = props.data.query?.trim().match(/^(select|insert)\b/i)?.[1];

  return (
    <>
      <PostgresQueryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={"/postgres.svg"}
        name="Postgres Query"
        description={
          variableName
            ? `${operation?.toUpperCase() || "SQL"} → ${variableName}`
            : "Run a parameterized query"
        }
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};

PostgresQueryNode.displayName = "Postgres Query Node";
