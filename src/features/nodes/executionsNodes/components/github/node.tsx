"use client";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { GitHubDialog, GitHubFormValues } from "./dialog";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";

export type GitHubNodeData = GitHubFormValues & { status?: NodeStatus };
export type GitHubNodeType = Node<GitHubNodeData>;

export const GitHubNode = (props: NodeProps<GitHubNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.GITHUB,
    topics: ["status"],
  });

  const handleSubmit = (values: GitHubFormValues) =>
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
      <GitHubDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <BaseExecutionNode
        {...props}
        id={props.id}
        status={props.data.status || "initial"}
        icon={"/github.svg"}
        name="GitHub"
        description={
          variableName
            ? `${props.data.operation || "createIssue"} → ${variableName}`
            : "GitHub issues"
        }
        onSettings={() => setDialogOpen(true)}
        onDoubleClick={() => setDialogOpen(true)}
      />
    </>
  );
};
GitHubNode.displayName = "GitHub Node";
