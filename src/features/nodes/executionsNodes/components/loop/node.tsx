"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Repeat2Icon } from "lucide-react";
import { useState } from "react";
import { BaseNode, BaseNodeContent } from "@/components/reactFlow/base-node";
import { BaseHandle } from "@/components/reactFlow/base-handle";
import { WorkflowNode } from "@/components/workflowNode";
import { NodeStatus } from "@/components/reactFlow/node-status-indicator";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { CHANNELS } from "@/config/channels";
import { LoopDialog, LoopFormValues } from "./dialog";

export type LoopNodeData = LoopFormValues & { status?: NodeStatus };
export type LoopNodeType = Node<LoopNodeData>;

export const LoopNode = (props: NodeProps<LoopNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes, setEdges } = useReactFlow();

  const handleSubmit = (values: LoopFormValues) => {
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

  useNodeStatus({
    nodeId: props.id,
    channel: CHANNELS.LOOP,
    topics: ["status"],
  });

  const sourceKey = props.data.sourceKey?.trim();
  const variableName = props.data.variableName?.trim();

  return (
    <>
      <LoopDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={{
          sourceKey: props.data.sourceKey,
          variableName: props.data.variableName,
        }}
      />

      <WorkflowNode
        name="Loop"
        description={sourceKey ? `Iterate ${sourceKey}` : "Iterate an array"}
        onDelete={handleDelete}
        onSettings={() => setDialogOpen(true)}
      >
        <BaseNode
          status={props.data.status || "initial"}
          onDoubleClick={() => setDialogOpen(true)}
          className="min-w-[220px] overflow-visible border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <BaseNodeContent className="p-0">
            <div className="flex items-center gap-3 border-b bg-muted/20 px-3 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <Repeat2Icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-none">Loop</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                  {sourceKey ? `over ${sourceKey}` : "Configure source array"}
                </p>
              </div>
            </div>

            <div className="space-y-2 px-3 py-3">
              <div className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-2.5 py-2 text-xs">
                <span className="text-muted-foreground">Source</span>
                <span className="max-w-[130px] truncate font-mono font-medium">
                  {sourceKey || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-2.5 py-2 text-xs">
                <span className="text-muted-foreground">Results</span>
                <span className="max-w-[130px] truncate font-mono font-medium">
                  {variableName || "—"}
                </span>
              </div>
            </div>

            <div className="space-y-1 border-t px-3 py-2.5">
              <div className="relative flex h-7 items-center justify-end pr-5 text-xs font-medium text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                  loop
                </span>
                <BaseHandle
                  id="loop"
                  type="source"
                  position={Position.Right}
                  className="!right-[-5px]"
                />
              </div>
              <div className="relative flex h-7 items-center justify-end pr-5 text-xs font-medium text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-0.5">
                  done
                </span>
                <BaseHandle
                  id="done"
                  type="source"
                  position={Position.Right}
                  className="!right-[-5px]"
                />
              </div>
            </div>

            <BaseHandle
              id="target-1"
              type="target"
              position={Position.Left}
              className="!left-[-5px]"
            />
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    </>
  );
};

LoopNode.displayName = "Loop Node";
