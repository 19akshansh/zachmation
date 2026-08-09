"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { GitMergeIcon } from "lucide-react";
import { useState } from "react";
import { BaseNode, BaseNodeContent } from "@/components/reactFlow/base-node";
import { BaseHandle } from "@/components/reactFlow/base-handle";
import { WorkflowNode } from "@/components/workflowNode";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";
import { MergeDialog, MergeFormValues } from "./dialog";

export type MergeNodeData = MergeFormValues & { status?: NodeStatus };
export type MergeNodeType = Node<MergeNodeData>;

export const MergeNode = (props: NodeProps<MergeNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes, setEdges } = useReactFlow();

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.MERGE,
    topics: ["status"],
  });

  const handleSubmit = (values: MergeFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? { ...node, data: { ...node.data, ...values } }
          : node,
      ),
    );
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== props.id));
    setEdges((edges) =>
      edges.filter(
        (edge) => edge.source !== props.id && edge.target !== props.id,
      ),
    );
  };

  const input1Key = props.data.input1Key?.trim();
  const input2Key = props.data.input2Key?.trim();
  const variableName = props.data.variableName?.trim();

  return (
    <>
      <MergeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />

      <WorkflowNode
        name="Merge"
        description={
          variableName ? `Combine into ${variableName}` : "Combine branch outputs"
        }
        onDelete={handleDelete}
        onSettings={() => setDialogOpen(true)}
      >
        <BaseNode
          status={props.data.status || "initial"}
          onDoubleClick={() => setDialogOpen(true)}
          className="min-w-[220px] overflow-visible border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <BaseNodeContent className="gap-0 p-0">
            <div className="flex items-center gap-3 border-b bg-muted/20 px-3 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <GitMergeIcon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-none">Merge</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                  Append branch arrays
                </p>
              </div>
            </div>

            <div className="space-y-1 border-b px-3 py-2.5">
              <div className="relative flex h-7 items-center gap-2 pl-5 text-xs font-medium">
                <BaseHandle
                  id="input1"
                  type="target"
                  position={Position.Left}
                  className="!left-[-5px]"
                />
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-primary">
                  {input1Key || "input1"}
                </span>
              </div>
              <div className="relative flex h-7 items-center gap-2 pl-5 text-xs font-medium">
                <BaseHandle
                  id="input2"
                  type="target"
                  position={Position.Left}
                  className="!left-[-5px]"
                />
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-primary">
                  {input2Key || "input2"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <span className="truncate text-[11px] text-muted-foreground">
                → {variableName || "merged"}
              </span>
              <BaseHandle
                id="source-1"
                type="source"
                position={Position.Right}
                className="!right-[-5px]"
              />
            </div>
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    </>
  );
};

MergeNode.displayName = "Merge Node";
